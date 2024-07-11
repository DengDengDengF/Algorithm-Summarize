[TOC]



## 查询、增加

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
                t_down_right = leaf.child.slice(length_low + 1);
            }
            t_left.child = t_down_left;
            t_right.child = t_down_right;
            //-------------------
            stackLength--;
            if (stackLength === -1) {
                leaf.key = [t];
                leaf.child = [t_left, t_right];
            } else {
                leaf = stack[stackLength];
                let index = binaryFind(leaf, 0, leaf.key.length - 1, t);
                let length = leaf.key.length;
                if (index === length - 1 && t >= leaf.key[index]) {
                    leaf.key.push(t);
                    leaf.child.pop();
                    leaf.child.push(t_left, t_right);
                } else {
                    leaf.key.splice(index, 0, t);
                    leaf.child[index] = t_right;
                    leaf.child.splice(index, 0, t_left);
                }
            }
            //处理上面节点
            //如果stackLength===-1,说明到头了，则，leaf.key=[t],leaf.child=[t_left,t_right];
            //通过调用search函数找到插入点 x，....如果进行比较后排最后，那么 leaf.child.pop();
            //leaf.child.push(t_left,t_right);
            //如果插入点x,....没有排在最后，那么
            //leaf.child[x]= t_right;leaf.child.splice(x,0,t_left);
        }
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
                // debugger
                wrongTree(stack, length_low, length_up);
            }
            stack = null;
        }
        return tree;
    }

    let arr = [18, 17, 21, 42, 24, 35, 16, 4, 7, 5, 1];
    console.log(composeBTree(arr, 4));
```

## 删除

![image.png](https://s2.loli.net/2024/07/07/J6DBh4XVQu1FLUZ.png)

![image.png](https://s2.loli.net/2024/07/07/UmnFiNLTXwaKkec.png)

```js
按照我写的逻辑，100%能拿下
合并后，会不会导致上溢出呢?
设：最大阶为M,关键字为k， [M/2]-1  <= k <= M-1;

当M是偶数，合并后，k= [M / 2] -1 + 1 + ([M / 2] - 2)
                k=M - 2;
                k<M-1;
当M是奇数，合并后  k=[(M+1)/2] -1 + 1 + ([(M+1)/2]-2)
                k=M-1
综上所述，不会导致上溢出。               
```

```js
  let tree = {
        key: [45],
        child: [{
            key: [30, 42],
            child: [{
                key: [10, 20],
                child: [],
            }, {
                key: [40, 41],
                child: [],
            }, {
                key: [43, 44],
                child: []
            }]
        }, {
            key: [51, 65, 74, 90],
            child: [
                {key: [46, 47, 50], child: []},
                {key: [53, 57, 60], child: []},
                {key: [68, 72], child: []},
                {key: [76, 83, 86], child: []},
                {key: [92, 98], child: []},
            ]
        }]
    };
    const M = 5;
    const length_low = Math.ceil(M / 2) - 1;

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
     * @return {Array|Null}  如果可以找到就返回栈，否则返回null;
     * */
    function searchData(tree, target) {
        let stack = [];
        stack.push(tree);
        let l = binaryFind(tree, 0, tree.key.length - 1, target);
        if (tree.key[l] === target) return stack;
        while (tree.child.length) {
            stack.push(tree.key[l] <= target ? tree.child[l + 1] : tree.child[l]);
            tree = tree.key[l] <= target ? tree.child[l + 1] : tree.child[l];
            l = binaryFind(tree, 0, tree.key.length - 1, target);
            if (tree.key[l] === target) return stack;
        }
        return null;
    }

    /**
     * @param {Object} tree 被删除节点所在的集
     * @param {Number} index 被删除节点所在的集下标
     * @return {Array|Null} 找到前驱/后继所过程中形成的栈*/
    function searchPreAndPost(tree, index) {
        //叶子节点
        if (!tree.child.length) return null;
        let stack = [[], []];
        let pre = tree.child[index], post = tree.child[index + 1];
        stack[0].push(pre);
        //找前驱所形成的栈
        while (pre.child.length) {
            stack[0].push(pre.child[pre.child.length - 1]);
            pre = pre.child[pre.child.length - 1];
        }
        //找后置所形成的栈
        stack[1].push(post);
        while (post.child.length) {
            stack[1].push(post.child[0]);
            post = post.child[0]
        }
        return stack;
    }

    /**
     * @param {Object} tree 父
     * @param {Number} l    潜在交换左下标
     * @param {Number} r    潜在交换右下标
     * @return {Object}     0均不可借,至少有1个可借*/
    function check(tree, l, r) {
        if (l === -1) {
            return tree.child[r].key.length - 1 >= length_low ? {status: 1, val: r} : {status: 0, val: null};
        }
        if (r === -1) {
            return tree.child[l].key.length - 1 >= length_low ? {status: 1, val: l} : {status: 0, val: null};
        } else {

            if (tree.child[r].key.length - 1 >= length_low) {
                return {status: 1, val: r};
            }
            if (tree.child[l].key.length - 1 >= length_low) {
                return {status: 1, val: l};
            }

        }
        return {status: 0, val: null};
    }


    /**左/右,有一个可借
     * @param {Object} middleTree 下溢出的子集
     * @param {Object} parentTree 父
     * @param {Number} m_index    下溢出的子集在父中的位置
     * @param {Number} borrow_index  可借的子(左/右)
     * @return {void}
     * */
    function borrow(middleTree, parentTree, m_index, borrow_index) {
        let temp;
        let insert;
        //借右侧
        if (borrow_index - 1 === m_index) {
            temp = parentTree.key[m_index];
            parentTree.key[m_index] = parentTree.child[borrow_index].key.shift();
            middleTree.key.push(temp);
            if (parentTree.child[borrow_index].child.length > 0) {
                insert = parentTree.child[borrow_index].child.shift();
                middleTree.child.push(insert);
            }
        } else {//借左侧
            temp = parentTree.key[borrow_index];
            parentTree.key[borrow_index] = parentTree.child[borrow_index].key.pop();
            middleTree.key.unshift(temp);
            if (parentTree.child[borrow_index].child.length > 0) {
                insert = parentTree.child[borrow_index].child.pop();
                middleTree.child.unshift(insert);
            }
        }
    }

    /**左/右，均不可借，采取合并
     * @param {Object}middleTree  下溢出子集
     * @param {Object} parentTree 父
     * @param {Number} m_index 下溢出的子集在父中的位置
     * @return {void}
     * */
    function merge(middleTree, parentTree, m_index) {
        // debugger
        let temp, part;
        //溢出合并到左
        if (middleTree.key[0] >= parentTree.key[m_index]) {
            temp = parentTree.key.pop();
            parentTree.child[m_index].key.push(temp);
            parentTree.child[m_index].key = parentTree.child[m_index].key.concat(middleTree.key);
            parentTree.child[m_index].child = parentTree.child[m_index].child.concat(middleTree.child);
            parentTree.child.length--;
        } else {//右合并到溢出
            // debugger
            temp = parentTree.key.splice(m_index, 1);
            middleTree.key.push(...temp);
            part = parentTree.child.splice(m_index + 1, 1)[0];
            middleTree.key = middleTree.key.concat(part.key);
            middleTree.child = middleTree.child.concat(part.child);
        }
    }

    /**
     * @param {Array} stack
     * @return {void}*/
    function fuckTree(stack) {
        //stack.length === 1说明，删的就剩下一层了，根节点也是叶子节点的关键字只要 >=1 就行;
        while (stack.length > 1 && stack[stack.length - 1].key.length < length_low) {
            let middle = stack.pop();
            let m_index = binaryFind(stack[stack.length - 1], 0, stack[stack.length - 1].key.length - 1, middle.key[0]);
            let l_index, r_index;
            //查了定义，才知道b树种的节点关键值不会重复，这里....算了，写就写吧
            // if (middle.key[0] === stack[stack.length - 1].key[m_index]) {
            //
            // } else {
            //
            // }
            if (m_index === 0) {
                l_index = -1;
                r_index = m_index + 1;
            } else if (m_index === stack[stack.length - 1].key.length - 1 && middle.key[0] >= stack[stack.length - 1].key[m_index]) {
                l_index = m_index;
                r_index = -1;
            } else {
                l_index = m_index - 1;
                r_index = m_index + 1;
            }
            let res = check(stack[stack.length - 1], l_index, r_index);
            // debugger
            // debugger
            if (res.status === 1) {//左/右，至少有1个可借
                borrow(middle, stack[stack.length - 1], m_index, res.val);
            } else {//左/右，均不可借
                merge(middle, stack[stack.length - 1], m_index)
                // debugger
            }
        }
    }

    /**
     * @param {Object} tree
     * @param {Number} target
     * @return {Object}*/
    function deleteData(tree, target) {
        let stack = searchData(tree, target);
        if (stack) {
            let targetObject = stack[stack.length - 1];//查找被删除数据形成的栈
            let index = binaryFind(targetObject, 0, targetObject.key.length - 1, target); //删除的数据在目标集合的位置
            let stack2 = searchPreAndPost(targetObject, index);//查找删除数据的前驱/后继，所形成的栈
            // debugger
            //非叶子节点
            if (stack2) {
                let pre = stack2[0][stack2[0].length - 1];//前驱
                let post = stack2[1][stack2[1].length - 1];//后继
                //后继节点替换后，不会导致下溢出
                if (post.key.length - 1 >= length_low) {
                    targetObject.key[index] = post.key.shift();
                    // console.log('后继替换后无溢出');
                    return tree;
                }
                //前驱节点替换后，不会导致下溢出
                if (pre.key.length - 1 >= length_low) {
                    targetObject.key[index] = pre.key.pop();
                    // console.log('前驱替换后无溢出');
                    return tree;
                }
                //前驱/后继，任意一个替换后都会下溢出，这里选取前驱节点
                targetObject.key[index] = pre.key.pop();
                // debugger
                stack = stack.concat(stack2[0]);
                stack2 = null;
            } else {//叶子节点
                targetObject.key.splice(index, 1);
            }
            //叶子节点
            // console.log('前驱/后继/叶子/', stack)
            fuckTree(stack);
            stack = null;
            if (tree.key.length === 0) {
                tree = tree.child[0];
            }
            return tree;
        }
        return null;
    }

    tree = deleteData(tree, 45)
    console.log('delete 45', tree);
    tree = deleteData(tree, 68)
    console.log('delete 68', tree);
    tree = deleteData(tree, 86)
    console.log('delete 86', tree);
    tree=deleteData(tree,30);
    console.log('delete 30', tree);
    tree=deleteData(tree,57);
    console.log('delete 57', tree);
    tree=deleteData(tree,53);
    console.log('delete 53', tree);
```

