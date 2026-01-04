[TOC]



### 1.运算

```js
把 `(1 + 2 + 3) * (3 + 4 + 6)`
计算栈
运算符栈
通过出栈、入栈，局部计算
```

### 2.补足左括号

```js
补足左括号`1+2) * 4+6))`，打印结果
计算栈
运算符栈
通过出栈、入栈，局部计算 
‘（’ + a + b + ')'
```

### 3.中序运算转后序运算

```js
中序：左根右
后序：左右根
例如：二叉树版本略，此处做另外的抽象
原来字符=(1+2)
中序: 1 + 2,  后序:1 2 +
计算栈
运算符栈
出两个计算栈 出一个运算符栈
```

### 4.计算后序表达式

```js
1 3 +
数字栈 1 3
字符栈  +

a =数字栈pop();//3
b =数字栈pop();//1
c =字符栈pop();//+
a c b = 1 + 3 = 4

```

### 5.文本缓冲区

![IMG_0728.jpeg](https://s2.loli.net/2025/11/27/xs6Q2kYmarKEzWy.jpg)

```js
Insert:L D F
  F
  _    
  D
  _
  L         
(STACK1) (STACK2 EMPTY)

LEFT(2)
            D
            _
  L         F
(STACK1)   (STACK2)

.......
双栈算法，通过出栈，避免了删除一个元素后面的元素都得移动的情况
```

### 6.校验出栈后的排列是否正确

![IMG_0740.jpeg](https://s2.loli.net/2025/12/01/1XIUWtrdJkYqMwc.jpg)

```js
假设序列 0,1,2......n-1 是按照顺序入栈的，可以中途出栈，给定一个出栈排列，判断是否正确

出栈就是在 递减
入栈就是在 递增

比如，图一中 先出5，再出1，默认2`已经先1`出了。再出2，显然不对
图二中，先出5，再出4，再出3，就可以。因为经过了0-5递增，默认`3，4已经push`进去了。
```

### 7.有限个栈，构成队列，队列的操作通过栈实现必须是常数次

#### **1.违反栈的概念方案**

![image.png](https://s2.loli.net/2025/12/10/pDjRYzvy3GgdHbV.png)

```js
这套方案，是基于
1.分块（固定长度）
2.块与块之前通过链表连接
3.`入队列`满了就加块
4.`出队列`要实现，`复制栈底 + 出栈并交换栈底`，也就是我会修改栈底元素，同时满足出栈o(1)
但是，会违反栈的抽象概念
```

#### **2.摊还o(1)** + 新旧快照

```java
import edu.princeton.cs.algs4.StdOut;
import Stack;//这里默认迭代器是从栈顶到栈底的
import java.util.Iterator;
import java.util.StringJoiner;

/**
 * Created by Rene Argento on 2/1/2026.
 */
// Based on the paper "Real Time Queue Operations in Pure LISP" by Robert Hood and Robert Melville
// Available at https://ecommons.cornell.edu/bitstream/handle/1813/6273/80-433.pdf

// Check http://stackoverflow.com/questions/5538192/how-to-implement-a-queue-with-three-stacks/ for a nice
// discussion about this topic and for an explanation of why a 3-stack solution may not exist.
// The best known solution is based on 6 stacks and this implementation is based on that solution.
public class Exercise49_QueueWithStacks<Item> implements Iterable<Item> {

    private Stack<Item> head;
    private Stack<Item> tail;

    private Stack<Item> reverseHead;
    private Stack<Item> reverseTail;

    private Stack<Item> tempTail;
    private Iterator<Item> headIteratorToReverse;
    private Iterator<Item> headIteratorToDequeue;

    private int size;

    private boolean isPerformingRecopy;
    private boolean finishedRecopyFirstPass;

    private int numberOfItemsDeletedDuringRecopy;

    public Exercise49_QueueWithStacks() {
        head = new Stack<>();
        tail = new Stack<>();
        reverseHead = new Stack<>();
        reverseTail = new Stack<>();
        tempTail = new Stack<>();
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public int size() {
        return size;
    }

    public void enqueue(Item item) {
        //没在复制过程往tail里推，反之推入临时tail
        if (!isPerformingRecopy) {
            tail.push(item);
        } else {
            tempTail.push(item);
            performRecopySteps();
        }

        size++;
        //开始复制逻辑
        if (!isPerformingRecopy && tail.size() > head.size()) {
            startRecopy();
            performRecopySteps();
        }
    }

    public Item dequeue() {

        if (isEmpty()) {
            throw new RuntimeException("Queue underflow");
        }

        Item item;
        //没在复制就直接出，在复制就 head迭代模拟出
        if (!isPerformingRecopy) {
            item = head.pop();
        } else {
            //从旧的快照中获取的，很重要
            // 从“队列当前的逻辑头部视图”中取下一个元素，
            // 该视图可能由各个不同时期的栈组合而成，
            // 并将其逐步复制到 reverseHead 中
            item = headIteratorToDequeue.next();
            numberOfItemsDeletedDuringRecopy++;

            performRecopySteps();
        }

        size--;

        if (!isPerformingRecopy && tail.size() > head.size()) {
            startRecopy();
            performRecopySteps();
        }

        return item;
    }

    // Perform 2 steps in the recopy process
    private void performRecopySteps() {
       //这里多执行，就是为了处理，`head遍历空了，但是复制还没结束`
       /**举例子：
         顺序默认从栈底到栈顶
         head = [3,2,1]
         tail = [4,5]
         head.pop() // 1
         head.pop() // 2
         ......
         此处double复制到意义
         每出一次队列，double次，刚好也给了二阶段关键代码 `reverseTail.push(tail.pop());`时间。
       */
        if (!finishedRecopyFirstPass) {
            performRecopyFirstPassStep();

            if (!finishedRecopyFirstPass) {
                performRecopyFirstPassStep();
            } else {
                performRecopySecondPassStep();
            }
        } else {
            performRecopySecondPassStep();

            if (isPerformingRecopy) {
                performRecopySecondPassStep();
            }
        }
    }

    private void startRecopy() {
        isPerformingRecopy = true;
        //生成旧快照（由于上次复制摊还生成的head快照）
        //同时，这时候的reverseTail.size() == 0  tempTail.size() == 0
        //这里的iterator用的是栈的迭代器，这里是针对的head
        headIteratorToReverse = head.iterator();
        headIteratorToDequeue = head.iterator();
    }

    private void performRecopyFirstPassStep() {
        if (tail.size() > 0) {
            reverseTail.push(tail.pop());
        }
        //从旧的head快照中获取的，很重要
        // 从“队列当前的逻辑头部视图”中取下一个元素，
        // 并将其逐步复制到 reverseHead 中
        if (headIteratorToReverse.hasNext()) {
            reverseHead.push(headIteratorToReverse.next());
        }

        if (tail.isEmpty() && !headIteratorToReverse.hasNext()) {
            finishedRecopyFirstPass = true;
        }
    }

    private void performRecopySecondPassStep() {

        if (reverseHead.size() > numberOfItemsDeletedDuringRecopy) {
            reverseTail.push(reverseHead.pop());
        }

        if (reverseHead.size() == numberOfItemsDeletedDuringRecopy) {
            // Update main stacks
            head = reverseTail;
            tail = tempTail;

            // Clear temporary stacks
            reverseHead = new Stack<>();
            reverseTail = new Stack<>();
            tempTail = new Stack<>();

            numberOfItemsDeletedDuringRecopy = 0;

            // Recopy process done
            //同时也让下一次的复制，tempTail.size() == 0 reverseTail.size() == 0 
            isPerformingRecopy = false;
            finishedRecopyFirstPass = false;
        }
    }
    //这里的复写，就是为了，方便打印toString()遍历的时候用
    @Override
    public Iterator<Item> iterator() {
        return new QueueWithStacksIterator();
    }

    private class QueueWithStacksIterator implements Iterator<Item> {

        private int index;
        private Stack<Item> reverseTailCopy;

        private Iterator<Item> headIterator;
        private Iterator<Item> reverseTailCopyIterator;

        public QueueWithStacksIterator() {
            index = 0;
            reverseTailCopy = new Stack<>();

            if (!isPerformingRecopy) {
                for (Item item : tail) {
                    reverseTailCopy.push(item);
                }

                headIterator = head.iterator();
            } else {
                //这里在打印阶段可能触发
                if(tempTail.size() > 0  || reverseTail.size() > 0){
                    StdOut.println("debugger");
                }
                // Get items in tail
                for (Item item : tempTail) {
                    reverseTailCopy.push(item);
                }

                for (Item item : tail) {
                    reverseTailCopy.push(item);
                }

                Stack<Item> reverseReverseTail = new Stack<>();

                for (Item item : reverseTail) {
                    reverseReverseTail.push(item);
                }
                for (Item item : reverseReverseTail) {
                    reverseTailCopy.push(item);
                }

                // Get items in head
                Stack<Item> reverseReverseHead = new Stack<>();
                for (Item item : reverseHead) {
                    reverseReverseHead.push(item);
                }

                Stack<Item> reverseHeadMinusDeletedItemsStack = new Stack<>();
                while (reverseReverseHead.size() > numberOfItemsDeletedDuringRecopy) {
                    reverseHeadMinusDeletedItemsStack.push(reverseReverseHead.pop());
                }

                Stack<Item> headIteratorStack = new Stack<>();
                while (!reverseHeadMinusDeletedItemsStack.isEmpty()) {
                    headIteratorStack.push(reverseHeadMinusDeletedItemsStack.pop());
                }

                headIterator = headIteratorStack.iterator();
            }

            reverseTailCopyIterator = reverseTailCopy.iterator();
        }

        @Override
        public boolean hasNext() {
            return index < size();
        }

        @Override
        public Item next() {
            Item item;

            if (headIterator.hasNext()) {
                item = headIterator.next();
            } else {
                item = reverseTailCopyIterator.next();
            }

            index++;
            return item;
        }
    }

    public static void main(String[] args) {
        Exercise49_QueueWithStacks<Integer> queueWithStacks = new Exercise49_QueueWithStacks<>();
        queueWithStacks.enqueue(0);

        queueWithStacks.dequeue();
        StdOut.println("Queue size: " + queueWithStacks.size());
        StdOut.println("Expected: 0");
//
        queueWithStacks.enqueue(1);
        queueWithStacks.enqueue(2);
        queueWithStacks.enqueue(3);
//
        StdOut.println("\nQueue size: " + queueWithStacks.size());
        StdOut.println("Expected: 3");

        StringJoiner queueItems1 = new StringJoiner(" ");
        for (int item : queueWithStacks) {
            queueItems1.add(String.valueOf(item));
        }

        StdOut.println("Queue items: " + queueItems1.toString());
        StdOut.println("Expected: 1 2 3");
//
        queueWithStacks.enqueue(4);
//
        StringJoiner queueItems2 = new StringJoiner(" ");
        for (int item : queueWithStacks) {
            queueItems2.add(String.valueOf(item));
        }

        StdOut.println("\nQueue items: " + queueItems2.toString());
        StdOut.println("Expected: 1 2 3 4");
//
        queueWithStacks.dequeue();
        queueWithStacks.dequeue();
        queueWithStacks.dequeue();
//
        StringJoiner queueItems3 = new StringJoiner(" ");
        for (int item : queueWithStacks) {
            queueItems3.add(String.valueOf(item));
        }

        StdOut.println("\nQueue size: " + queueWithStacks.size());
        StdOut.println("Expected: 1");

        StdOut.println("Queue items: " + queueItems3.toString());
        StdOut.println("Expected: 4");
    }
}
```

过程图解：

1. `queueWithStacks.enqueue(0);`

![IMG_0802.jpeg](https://s2.loli.net/2026/01/02/47ySbzwgEUqBtrF.jpg)

2.`queueWithStacks.dequeue();`

![2026-01-02 12.48.10.jpeg](https://s2.loli.net/2026/01/02/rIDBhxLfulSQ2Hj.jpg)

3.`queueWithStacks.enqueue(1);`,` queueWithStacks.enqueue(2);`,`queueWithStacks.enqueue(3);`

![IMG_0798.jpeg](https://s2.loli.net/2026/01/02/eWdcqGi32M7ETpA.jpg)  

4.`queueWithStacks.enqueue(4);`

![IMG_0799.jpeg](https://s2.loli.net/2026/01/02/bQYFsOBSAvWP6Ny.jpg)

5. `queueWithStacks.dequeue();queueWithStacks.dequeue(); queueWithStacks.dequeue();`
   
   ![IMG_0800.jpeg](https://s2.loli.net/2026/01/02/KvZVOkur8TYXf3N.jpg)
   
   

![2026-01-02 13.00.40.jpeg](https://s2.loli.net/2026/01/02/oUg8JIW5QLSluBe.jpg)
