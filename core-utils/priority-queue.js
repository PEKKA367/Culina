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

    // Look at the oldest / newest item without removing it. O(1).
    peek(mode) {
        const node = this._pickNode(mode);
        return node === null ? undefined : node.item;
    }

    // Remove and return an item by mode ('oldest' | 'newest').
    dequeue(mode) {
        const node = this._pickNode(mode);
        if (node === null) return undefined;
        this._removeNode(node);
        return node.item;
    }

    _pickNode(mode) {
        if (this._size === 0) return null;
        if (mode === 'oldest') return this._head;
        if (mode === 'newest') return this._tail;
        return null;
    }

    // Detach a node from the linked list in O(1).
    // No splice / findIndex needed because we already hold the node reference.
    _removeNode(node) {
        if (node.prev === null) {
            this._head = node.next;
        } else {
            node.prev.next = node.next;
        }

        if (node.next === null) {
            this._tail = node.prev;
        } else {
            node.next.prev = node.prev;
        }

        this._size--;
    }
}
