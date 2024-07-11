### 1.添加查询

![image.png](https://s2.loli.net/2024/07/11/zxXUmEud3Oy6oZQ.png)

```js
   //生成叶子节点
    function leafNodes() {
        return {
            key: [], child: [], next: null,
        }
    }

    //生成非叶子节点
    function nonLeafNodes() {
        return {
            key: [], child: [],
        }
    }

    /**二分查找
     * @param {Object} tree  B树
     * @param{Number} l  左
     * @param{Number} r  右
     * @param {Number} target 要插入的目标值
     * @return {Number}  返回目标值要插入的index
     * */
    function binaryFind(tree, l, r, target) {
        while (l < r) {
            let m = Math.floor((l + r) / 2);
            if (tree.key[m] >= target) {
                r = m;
            } else {
                l = m + 1;
            }
        }
        return l;
    }

    /**查找栈
     * @param {Object} tree  B树
     * @param {Number} target 要插入的目标值
     * @return {Array}  返回查找栈
     * */
    function search(tree, target) {
        let stack = [];
        while (tree.child.length > 0) {
            let l = 0, r = tree.key.length - 1;
            l = binaryFind(tree, l, r, target);
            stack.push(tree);
            tree = target >= tree.key[l] ? tree.child[l + 1] : tree.child[l]
        }
        stack.push(tree);
        return stack
    }

    /**插入有序数组
     * @param {Object} tree leaf
     * @param {number} l 左
     * @param {number} r 右
     * @param {number} target 目标值*/
    function insertSort(tree, l, r, target) {
        if (tree.key.length === 0 || target >= tree.key[r]) {
            tree.key.push(target);
            return;
        }
        let left = binaryFind(tree, l, r, target);
        while (r >= left) {
            tree.key[r + 1] = tree.key[r];
            r--;
        }
        tree.key[left] = target;
    }

    /**上溢出，调整叶子节点
     * @param {Array} stack 路径栈
     * @param {Number} M 最大阶
     * @return {void}*/
    function manualLeaf(stack, M) {
        let leaf = stack[stack.length - 1];
        let temp = leaf.next;
        let half = Math.ceil(M / 2) - 1;

        let newLeaf = leafNodes();
        newLeaf.key = leaf.key.splice(half + 1);

        //栈中只有一个数据，说明此数据是跟节点,也是叶子节点
        if (stack.length === 1) {
            let preLeaf = leafNodes();
            preLeaf.key = leaf.key.splice(0, half + 1);
            preLeaf.next = newLeaf;
            newLeaf.next = temp;
            leaf.key.push(newLeaf.key[0]);
            leaf.child.push(preLeaf, newLeaf);
            delete leaf["next"];
        } else {
            let nonLeaf = stack[stack.length - 2];
            let l = 0, r = nonLeaf.key.length - 1;
            l = binaryFind(nonLeaf, l, r, newLeaf.key[newLeaf.key.length - 1]);
            leaf.next = newLeaf;
            newLeaf.next = temp;
            if (newLeaf.key[newLeaf.key.length - 1] < nonLeaf.key[l]) {
                nonLeaf.key.splice(l, 0, newLeaf.key[0]);
                nonLeaf.child.splice(l + 1, 0, newLeaf);
            } else {
                nonLeaf.key.push(newLeaf.key[0]);
                nonLeaf.child.push(newLeaf);
            }
            stack.pop();
            //至此，叶子节点的连接已经处理完毕了，该处理变动引起的非叶子节点连锁反应了
            manualNonLeaf(stack, M);
        }
    }

    /**
     * 调整叶子节点上溢出，引起非叶子节点的上溢出
     * @param {Array} stack  路径栈
     * @param {Number} M 最大阶
     * @return {void}
     * */
    function manualNonLeaf(stack, M) {
        let length_up = M - 1;
        let half = Math.ceil(M / 2) - 1;
        while (stack.length > 0 && stack[stack.length - 1].key.length > length_up) {
            let nonLeaf = stack[stack.length - 1];
            let newNonLeaf = nonLeafNodes();
            newNonLeaf.key = nonLeaf.key.splice(half + 1);
            newNonLeaf.child = nonLeaf.child.splice(half + 1);
            if (stack.length === 1) {
                let preNonLeaf = nonLeafNodes();
                preNonLeaf.key = nonLeaf.key.splice(0, half);
                preNonLeaf.child = nonLeaf.child.splice(0, half + 1);
                //key在splice过程中，剩下了指定的，也就是变相填充好了
                //child在splice过程中，空了,child准备填充
                nonLeaf.child.push(preNonLeaf, newNonLeaf);
            } else {
                let up = stack[stack.length - 2];
                let l = 0, r = up.key.length - 1;
                l = binaryFind(up, l, r, newNonLeaf.key[newNonLeaf.key.length - 1]);
                if (newNonLeaf.key[newNonLeaf.key.length - 1] < up.key[l]) {
                    up.key.splice(l, 0, nonLeaf.key.pop());
                    up.child.splice(l + 1, 0, newNonLeaf);
                } else {
                    up.key.push(nonLeaf.key.pop());
                    up.child.push(newNonLeaf);
                }
            }
            stack.pop();
        }
    }

    /**b+树主函数，传进来数组，返回b+树
     * @param {Array} arr  带插入数组
     * @param {Number} M   最大阶
     * @return {Object}  b+树*/
    function composeBPlusTree(arr, M) {
        let tree = leafNodes();
        let length_up = M - 1;
        while (arr.length > 0) {
            let target = arr.pop();
            let stack = search(tree, target);
            let leaf = stack[stack.length - 1];
            insertSort(leaf, 0, leaf.key.length - 1, target);
            //叶子节点上溢出了
            if (leaf.key.length > length_up) {

                //调整叶子节点，引起连锁反应后调整非叶子节点
                manualLeaf(stack, M);
            }
        }
        return tree;
    }

    let arr = [5,6,7,8,9,10,15,16,17,18,19,20,21,22];
    let tree=composeBPlusTree(arr, 5);
    console.log('添加arr',tree);
```

