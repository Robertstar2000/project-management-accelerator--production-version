let channel: BroadcastChannel | null = null;

try {
    channel = new BroadcastChannel('hmap-project-sync');
} catch (error) {
    console.warn('BroadcastChannel not supported:', error);
}

export const subscribeToUpdates = (callback: () => void) => {
    if (!channel) return () => {};
    
    const handler = (event: MessageEvent) => {
        try {
            if (event.data === 'update') {
                callback();
            }
        } catch (error) {
            console.error('Error in sync callback:', error);
        }
    };
    channel.addEventListener('message', handler);
    return () => channel?.removeEventListener('message', handler);
};

export const notifyUpdate = () => {
    try {
        channel?.postMessage('update');
    } catch (error) {
        console.error('Error notifying update:', error);
    }
};
