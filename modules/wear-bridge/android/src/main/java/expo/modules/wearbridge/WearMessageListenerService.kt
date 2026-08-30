package expo.modules.wearbridge

import android.content.Context
import com.google.android.gms.wearable.DataMap
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.WearableListenerService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import org.json.JSONArray

class WearMessageListenerService : WearableListenerService() {

    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onMessageReceived(messageEvent: MessageEvent) {
        when (messageEvent.path) {
            "/bp-log", "/med-log" -> {
                val payload = String(messageEvent.data, Charsets.UTF_8)
                WearBridgeEvents.emit(messageEvent.path, payload)
            }
            "/med-list-request" -> {
                // Watch is asking for the current medication list (sent on cold start).
                // Respond by pushing the active med list via DataClient so the watch's
                // WearDataListenerService.onDataChanged fires with the fresh list.
                scope.launch { pushMedListToWatch(this@WearMessageListenerService) }
            }
        }
    }

    /**
     * Reads the active medication list from the app's SQLite database and
     * pushes it to the watch via DataClient.putDataItem().
     *
     * The payload is stored under the "list" key inside a DataMap so the
     * watch-side WearDataListenerService can read it with:
     *   DataMapItem.fromDataItem(event.dataItem).dataMap.getString("list")
     */
    private suspend fun pushMedListToWatch(context: Context) {
        try {
            val db = android.database.sqlite.SQLiteDatabase.openDatabase(
                context.getDatabasePath("health_tracker.db").absolutePath,
                null,
                android.database.sqlite.SQLiteDatabase.OPEN_READONLY,
            )
            val names = mutableListOf<String>()
            db.rawQuery(
                "SELECT name FROM medications WHERE is_active = 'Aktif' AND deleted = 0 ORDER BY name ASC",
                null,
            ).use { cursor ->
                while (cursor.moveToNext()) {
                    names.add(cursor.getString(0))
                }
            }
            db.close()

            val jsonPayload = JSONArray(names).toString()
            val request = PutDataMapRequest.create("/med-list").apply {
                dataMap.putString("list", jsonPayload)
                // Force an update even if the list hasn't changed by bumping the timestamp.
                dataMap.putLong("ts", System.currentTimeMillis())
            }
            Wearable.getDataClient(context)
                .putDataItem(request.asPutDataRequest().setUrgent())
                .await()
        } catch (_: Exception) {
            // DB might not exist yet or watch might be disconnected — safe to ignore.
        }
    }
}
