// Demo for BiPriorityQueue from culina-utils.
// Open DevTools console after loading pages/demos.html to see the output.

import { BiPriorityQueue } from "culina-utils";


const queue = new BiPriorityQueue();

// Five tasks with chess-board priorities. The order of enqueue matters
// because equal priorities are tie-broken by insertion order.
queue.enqueue("wash dishes",  3);
queue.enqueue("walk the dog", 1);
queue.enqueue("buy bread",    5);
queue.enqueue("call mom",     1); // same priority as 'walk the dog'
queue.enqueue("pay bills",    2);

console.log("--- BiPriorityQueue demo ---");
console.log("size:", queue.size);              // 5

// peek doesn't change the queue
console.log("peek oldest :", queue.peek("oldest"));   // wash dishes
console.log("peek newest :", queue.peek("newest"));   // pay bills
console.log("peek highest:", queue.peek("highest"));  // buy bread (p=5)
console.log("peek lowest :", queue.peek("lowest"));   // walk the dog (p=1, earlier seq)

// dequeue removes
console.log("dequeue highest:", queue.dequeue("highest")); // buy bread
console.log("dequeue lowest :", queue.dequeue("lowest"));  // walk the dog
console.log("dequeue oldest :", queue.dequeue("oldest"));  // wash dishes
console.log("dequeue newest :", queue.dequeue("newest"));  // pay bills

console.log("size after 4 dequeues:", queue.size);    // 1
console.log("last item:", queue.dequeue("oldest"));   // call mom
console.log("size when empty:", queue.size);          // 0
