package expo.modules.wearbridge

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WearMessageListenerService : WearableListenerService() {
    override fun onMessageReceived(messageEvent: MessageEvent) {
        val payload = String(messageEvent.data, Charsets.UTF_8)
        WearBridgeEvents.emit(messageEvent.path, payload)
    }
}
