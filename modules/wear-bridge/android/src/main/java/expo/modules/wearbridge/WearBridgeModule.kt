package expo.modules.wearbridge

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import org.json.JSONArray
import org.json.JSONObject
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable

class WearBridgeModule : Module() {
    private var job: Job? = null

    override fun definition() = ModuleDefinition {
        Name("WearBridge")

        Events("onWearBpLog", "onWearMedLog")

        OnStartObserving {
            job = CoroutineScope(Dispatchers.Default).launch {
                WearBridgeEvents.messages.collect { message ->
                    try {
                        val json = JSONObject(message.payload)
                        when (message.path) {
                            "/bp-log" -> sendEvent(
                                "onWearBpLog",
                                mapOf(
                                    "sys" to json.getInt("sys"),
                                    "dia" to json.getInt("dia"),
                                    "pulse" to if (json.isNull("pulse")) null else json.optInt("pulse"),
                                    "timestamp" to json.getString("timestamp"),
                                    "note" to json.optString("note", ""),
                                ),
                            )
                            "/med-log" -> sendEvent(
                                "onWearMedLog",
                                mapOf(
                                    "medName" to json.getString("medName"),
                                    "mealType" to json.getString("mealType"),
                                    "timestamp" to json.getString("timestamp"),
                                ),
                            )
                        }
                    } catch (e: Exception) {
                        // Malformed payload — ignore rather than crash the listener.
                    }
                }
            }
        }

        OnStopObserving {
            job?.cancel()
            job = null
        }

        /**
         * Pushes the given medication name array to the paired watch via
         * DataClient.putDataItem("/med-list"). The watch reads this in
         * WearDataListenerService.onDataChanged via DataMapItem.
         *
         * Call this whenever the user's active medication list changes
         * (add, edit, delete, or activate/deactivate a medication).
         *
         * JS usage:
         *   import { syncMedicineList } from "wear-bridge";
         *   await syncMedicineList(["İlaç A", "İlaç B"]);
         */
        AsyncFunction("syncMedicineList") { names: List<String> ->
        AsyncFunction("syncMedicineList") { names: List<String>, promise: expo.modules.kotlin.Promise ->
            val context = appContext.reactContext
                ?: throw Exception("React context not available")
            if (context == null) {
                promise.reject("ERR", "React context not available", null)
                return@AsyncFunction
            }
            val jsonPayload = JSONArray(names).toString()
            val request = PutDataMapRequest.create("/med-list").apply {
                dataMap.putString("list", jsonPayload)
                dataMap.putLong("ts", System.currentTimeMillis())
            }
            Wearable.getDataClient(context)
                .putDataItem(request.asPutDataRequest().setUrgent())
                .await()
                .addOnSuccessListener {
                    promise.resolve(null)
                }
                .addOnFailureListener { e ->
                    promise.reject("ERR", e.message, e)
                }
        }
    }
}
