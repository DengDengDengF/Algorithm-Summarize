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

### 删除

![image.png](https://s2.loli.net/2024/07/12/hzWKs5rmMeVbjAi.png)

```js
  const M = 5;
    const length_low = Math.ceil(M / 2) - 1;


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

    /**返回查找栈，
     * @param {Object} tree b+树
     * @param {Number} target 要删除的目标值
     * @return {Array} 查找值过程中形成的栈*/
    function searchData(tree, target) {
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

    /**
     * @param{Array} stack     栈
     * @param{Number} target   删除的数据
     * @param{Number}replaceData 替换的数据
     * @return{void}
     * */
    function replaceInStack(stack, target, replaceData) {
        let index = stack.length - 1;
        while (index >= 0) {
            let nonLeaf = stack[index];
            let l = 0, r = nonLeaf.key.length - 1;
            l = binaryFind(nonLeaf, l, r, target);
            if (nonLeaf.key[l] === target) {
                nonLeaf.key[l] = replaceData;
                return;
            }
            index--;
        }
    }

    /**
     * @param {Array} stack
     * @param {Number} target
     * @return {void}*/
    function deleteInStack(stack, target) {
        let index = stack.length - 1;
        while (index >= 0) {
            let nonLeaf = stack[index];
            let l = 0, r = nonLeaf.key.length - 1;
            l = binaryFind(nonLeaf, l, r, target);
            if (nonLeaf.key[l] === target) {
                nonLeaf.key.splice(l, 1);
                nonLeaf.child.splice(l + 1, 1);
                return;
            }
            index--;
        }
    }

    /**检查叶子节点,可借/合并
     * @param {Object} nonLeaf     非叶子节点，也是删除叶子节点的父
     * @param {Number} deletedData 被删除的数据
     * @return {Object} */
    function checkLeaf(nonLeaf, deletedData) {
        let temp_index, m;
        temp_index = binaryFind(nonLeaf, 0, nonLeaf.key.length - 1, deletedData);
        //若最大M=3阶,low_length=Math.ceil(M / 2) -1 =1,最低一个数据，刚好给这个数据给删了....
        if (temp_index === nonLeaf.key.length - 1) {
            if (deletedData < nonLeaf.key[temp_index]) {
                m = temp_index;
            } else {
                m = temp_index + 1;
            }
        } else {
            if (deletedData < nonLeaf.key[temp_index]) {
                m = temp_index;
            } else if (deletedData === nonLeaf.key[temp_index]) {
                m = temp_index + 1;
            }
        }
        //有左节点,检查左节点是否符合
        if (m - 1 >= 0 && nonLeaf.child[m - 1].key.length - 1 >= length_low) {
            return {flag: true, val: m - 1, m: m};
        }
        //有右节点,检查右节点是否符合
        if (m + 1 <= nonLeaf.child.length - 1 && nonLeaf.child[m + 1].key.length - 1 >= length_low) {
            return {flag: true, val: m + 1, m: m};
        }
        return {flag: false, val: null, m: m};
    }

    /**叶子节点，有一侧可借
     * @param {Object} leaf         叶子节点
     * @param {Object} nonLeaf      非叶子节点
     * @param {Number} leafIndex    叶子节点的下标
     * @param {Number} borrowIndex  可借的叶子节点下标
     * @param {Array}  stack        栈
     * @param {Number} deletedData  被删除数据
     * @param {Number} deletedDataIndex 被删除数据index
     * @return {void}*/
    function borrowLeaf(leaf, nonLeaf, leafIndex, borrowIndex, stack, deletedData, deletedDataIndex) {
        let borrow = nonLeaf.child[borrowIndex];
        //借右侧
        if (borrowIndex - 1 === leafIndex) {
            let rHead = borrow.key.shift();
            leaf.key.push(rHead);
            replaceInStack(stack, rHead, borrow.key[0]);
            if (deletedDataIndex === 0) {
                replaceInStack(stack, deletedData, leaf.key[0]);
            }
        } else {//借左侧
            let lTail = borrow.key.pop();
            leaf.key.unshift(lTail);
            if (deletedDataIndex === 0) {
                replaceInStack(stack, deletedData, leaf.key[0]);
            } else {
                replaceInStack(stack, leaf.key[1], leaf.key[0]);
            }
        }
    }

    /**叶子节点，两侧均不可借，采取合并
     * @param {Object} leaf    叶子节点
     * @param {Object} nonLeaf 非叶子节点，叶子节点的父
     * @param {Number} leafIndex 叶子节点的下标
     * @param {Array}  stack        栈
     * @param {Number} deletedData  被删除数据
     * @param {Number} deletedDataIndex 被删除数据index
     * @return {void}*/
    function mergeLeaf(leaf, nonLeaf, leafIndex, stack, deletedData, deletedDataIndex) {
        let temp, leafHead;
        //有左节点,合并左节点
        if (leafIndex - 1 >= 0) {
            temp = leaf.next;
            nonLeaf.child[leafIndex - 1].key = nonLeaf.child[leafIndex - 1].key.concat(leaf.key);
            nonLeaf.child[leafIndex - 1].next = temp;
            if (deletedDataIndex === 0) {
                deleteInStack(stack, deletedData);
            } else {
                deleteInStack(stack, leaf.key[0]);
            }
            //叶子节点处理完毕检查非叶子节点
            dealNonLeaf(stack);
            return
        }
        //没左节点，合并右节点
        if (leafIndex + 1 <= nonLeaf.child.length - 1) {
            temp = nonLeaf.child[leafIndex + 1].next;
            leaf.key = leaf.key.concat(nonLeaf.child[leafIndex + 1].key);
            leaf.next = temp;
            deleteInStack(stack, nonLeaf.child[leafIndex + 1].key[0]);
            if (deletedDataIndex === 0) {
                replaceInStack(stack, deletedData, leaf.key[0]);
            }
            //叶子节点处理完毕检查非叶子节点
            dealNonLeaf(stack);
            return;
        }
    }

    /**处理叶子节点下溢出
     * @param {Array} stack   栈
     * @param {Number} deletedData 删除的数据
     * @param {Number}deletedDataIndex 删除数据下标
     * @return {void}*/
    function dealLeaf(stack, deletedData, deletedDataIndex) {
        let leaf = stack[stack.length - 1];
        let nonLeaf = stack[stack.length - 2];
        //叶子节点是合并?还是借?这个函数给答案
        let res = checkLeaf(nonLeaf, deletedData);
        stack.pop();
        if (res.flag) {
            borrowLeaf(leaf, nonLeaf, res.m, res.val, stack, deletedData, deletedDataIndex);
        } else {
            // console.log('合并res.m',res.m);
            mergeLeaf(leaf, nonLeaf, res.m, stack, deletedData, deletedDataIndex);
        }
    }


    /**检查非叶子节点，可借/合并
     * @param {Object} son  子节点
     * @param {Object} parent 父节点
     * @return {Object}*/
    function checkNonLeaf(son, parent) {
        let m = binaryFind(parent, 0, parent.key.length - 1, son.key[0]);
        let l, r;
        if (m === 0) {
            l = -1;
            r = m + 1;
        } else if (m === parent.key.length - 1 && son.key[0] >= parent.key[m]) {
            l = m;
            r = -1;
        } else {
            l = m - 1;
            r = m + 1;
        }
        if (l === -1) {
            return parent.child[r].key.length - 1 >= length_low ? {status: 1, middle: m, val: r} : {
                status: 0,
                val: null,
                middle: m
            };
        }
        if (r === -1) {
            return parent.child[l].key.length - 1 >= length_low ? {status: 1, val: l, middle: m} : {
                status: 0,
                val: null,
                middle: m
            };
        } else {
            if (parent.child[r].key.length - 1 >= length_low) {
                return {status: 1, val: r, middle: m};
            }
            if (parent.child[l].key.length - 1 >= length_low) {
                return {status: 1, val: l, middle: m};
            }

        }
        return {status: 0, val: null, middle: m};
    }

    /**
     * 非叶子节点，有一侧可借
     @param {Object} middleTree 下溢出的子集
     @param {Object} parentTree 父
     @param {Number} m_index    下溢出的子集在父中的位置
     @param {Number} borrow_index  可借的子(左/右)
     @return {void}
     * */
    function borrowNonLeaf(middleTree, parentTree, m_index, borrow_index) {
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

    /**非叶子节点，两侧均不可借，采取合并
     @param {Object}middleTree  下溢出子集
     @param {Object} parentTree 父
     @param {Number} m_index 下溢出的子集在父中的位置
     @return {void}*/
    function mergeNonLeaf(middleTree, parentTree, m_index) {
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

    /**处理非叶子节点下溢出
     * @param {Array} stack*/
    function dealNonLeaf(stack) {
        // console.log('非叶子节点stack', stack);
        //stack.length === 1,剩下最后一层叶子节点/根节点/ 关键字满足 >=1就行
        while (stack.length > 1 && stack[stack.length - 1].key.length < length_low) {
            let middle = stack.pop();
            let res = checkNonLeaf(middle, stack[stack.length - 1]);
            if (res.status === 1) {
                borrowNonLeaf(middle, stack[stack.length - 1], res.middle, res.val);
            } else {
                mergeNonLeaf(middle, stack[stack.length - 1], res.middle)
            }
            // debugger
        }
    }


    /**主函数
     * @param {Object} tree
     * @param {Number} target
     * @return {Object}*/
    function deleteData(tree, target) {
        let stack = searchData(tree, target);
        let leafNode = stack[stack.length - 1];
        let index = binaryFind(leafNode, 0, leafNode.key.length - 1, target);
        //数据在b+树中
        if (leafNode.key[index] === target) {
            //找到target,删除叶子节点
            leafNode.key.splice(index, 1);
            //stack.length === 1,说明根节点就是叶子节点，根节点.key.length最小值是1;
            if (stack.length > 1) {
                //叶子节点下溢出
                if (leafNode.key.length < length_low) {
                    // debugger
                    //处理叶子节点下溢出
                    dealLeaf(stack, target, index);
                } else {//叶子节点无下溢出
                    if (index === 0) {
                        stack.pop();
                        replaceInStack(stack, target, leafNode.key[0]);
                    }
                }
            }
        } else {//b+树不存在该数据
            return {status: 0, data: tree, errorMsg: '数据不在b+树中'}
        }
        if(tree.key.length === 0 && tree.child.length!== 0) tree=tree.child[0]
        return {status: 1, data: tree, errorMsg: '删除成功'};
    }
```

