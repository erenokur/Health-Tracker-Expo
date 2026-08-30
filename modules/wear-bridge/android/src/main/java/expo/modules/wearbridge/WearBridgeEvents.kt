package expo.modules.wearbridge

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.receiveAsFlow

/**
 * WearMessageListenerService is instantiated by the Android system whenever
 * a Wearable Data Layer message arrives — independently of whether the
 * WearBridgeModule (and therefore the JS app) currently exists. This
 * singleton is the hand-off point between the two: the service pushes
 * messages in here, and the module (once created) collects them and
 * forwards them to JS via events.
 */
object WearBridgeEvents {
    data class Message(val path: String, val payload: String)

    private val _messages = MutableSharedFlow<Message>(replay = 16, extraBufferCapacity = 16)
    val messages = _messages.asSharedFlow()
    private val _messages = Channel<Message>(capacity = 16)
    val messages = _messages.receiveAsFlow()

    fun emit(path: String, payload: String) {
        _messages.tryEmit(Message(path, payload))
        _messages.trySend(Message(path, payload))
    }
}
