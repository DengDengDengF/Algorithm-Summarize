```js
 function init() {
        return {
            key: [],
            child: []
        }
    }

    /**
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


    /**
     * @param {Object} tree  B树
     * @param {Number} target 要插入的目标值
     * @return {Array}  返回查找栈
     * */
    function search(tree, target) {
        let stack = [];
        stack.push(tree);
        while (tree.child.length) {
            let l = 0, r = tree.key.length - 1;
            l = binaryFind(tree, l, r, target);
            stack.push(tree.key[l] <= target ? tree.child[l + 1] : tree.child[l]);
            tree = tree.key[l] <= target ? tree.child[l + 1] : tree.child[l];
        }
        return stack;
    }

    /**
     * @param {Object} tree leaf
     * @param {number} l 左
     * @param {number} r 右
     * @param {number} target 目标值*/
    function insertSort(tree, l, r, target) {
        if (target >= tree.key[r]) {
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

    /**
     * @param {Array} stack
     * @param{Number} length_low
     * @param{Number} length_up
     * @return {void}
     * */
    function wrongTree(stack, length_low, length_up) {
        let stackLength = stack.length - 1;
        let leaf = stack[stackLength];
        while (stackLength >= 0 && leaf.key.length > length_up) {
            let t = leaf.key[length_low], t_left = init(), t_right = init();
            //处理同侧节点
            t_left.key = leaf.key.slice(0, length_low);
            t_right.key = leaf.key.slice(length_low + 1);
            let t_down_left = [], t_down_right = [];
            if (leaf.child.length > 0) {
                t_down_left = leaf.child.slice(0, length_low + 1);
                t_down_right = leaf.child.slice[length_low + 1];
            }
            t_left.child = t_down_left;
            t_right.child = t_down_right;
            //-------------------
            leaf = stack[stackLength - 1];
            stackLength--;
            //处理上面节点
            //通过调用search函数找到插入点 x，....如果进行比较后排最后，那么 leaf.child.pop();
            //leaf.child.push(t_left,t_right);
            //如果插入点x,....没有排在最后，那么
            //leaf.child[x]= t_right;leaf.child.splice(x,0,t_left);
        }
        debugger
    }

    /**
     * @param {Array} arr 目标数组
     * @param {Number} M  阶树
     * @return {Object}  B树
     * */
    function composeBTree(arr, M) {
        let tree = init();
        let length_low = Math.ceil(M / 2) - 1, length_up = M - 1;
        while (arr.length > 0) {
            let target = arr.pop();
            let stack = search(tree, target);
            let leaf = stack[stack.length - 1];
            insertSort(leaf, 0, leaf.key.length - 1, target);
            if (leaf.key.length > length_up) {
                wrongTree(stack, length_low, length_up);
            }
        }
        return tree;
    }

    let arr = [18, 17, 21, 42, 24, 35, 16, 4, 7, 5, 1];

    // composeBTree(arr, 4);
```

