// Bi-directional priority queue.
// Stores items in a doubly-linked list so that the oldest (head) and the
// newest (tail) are reachable in O(1). A monotonic counter is attached to
// every node so that equal priorities can still be ordered deterministically.

export class BiPriorityQueue {
    constructor() {
        this._head = null;
        this._tail = null;
        this._size = 0;
        this._seq = 0; // monotonic, never resets
    }

    get size() {
        return this._size;
    }

    // Append a new item with the given priority to the end of the queue.
    enqueue(item, priority) {
        const node = {
            item: item,
            priority: priority,
            seq: this._seq++,
            prev: this._tail,
            next: null
        };

        if (this._tail === null) {
            this._head = node;
        } else {
            this._tail.next = node;
        }
        this._tail = node;

        this._size++;
    }
}
