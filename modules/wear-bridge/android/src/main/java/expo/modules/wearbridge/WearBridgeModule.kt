package expo.modules.wearbridge

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.json.JSONObject

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
    }
}
