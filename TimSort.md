```js
  /**run的数量是2的幂次方效率最高
     * @param {number} n
     * @return {number}*/
    function minRunLength(n) {
        let r = 0;
        while (n >= 32) {
            r |= n & 1;
            n >>= 1;
        }
        return n + r;
    }

    /**
     * 用二分法，找到比val大的不能再大的下标
     * @param {Array} arr 数组
     * @param {number} l  左下标
     * @param {number} r  右下标
     * @param {number} val 目标值
     * @return {number} 目标值在左右下标区间的位置*/
    function findIndex(arr, l, r, val) {
        while (l < r) {
            let m = Math.floor((l + r) / 2);
            if (arr[m] === val) return m;
            if (arr[m] > val) {
                r = m;
            } else {
                l = m + 1;
            }
        }
        return l;
    }

    /**
     * @param {Array} arr 完整数组=[有序数组1[开始坐标],....有序数组2[结束坐标]]
     * @param {Array} a  有序数组1[开始坐标，结束坐标]
     * @param {Array} b  有序数组2[开始坐标，结束坐标]
     * @return {Array} 排序后的数组*/
    function patch(arr, a, b) {
        let l = a[1] - a[0] + 1;
        let r = b[1] - b[0] + 1;
        let temp = [];
        //取一个长度小的放进临时空间
        temp = l < r ? arr.slice(a[0], a[1] + 1) : arr.slice(b[0], b[1] + 1);
        //a的末尾在b的位置，b的开头在a的位置，之所以这么写，因为数组是从下标是从a到b的
        let j = findIndex(arr, b[0], b[1], arr[a[1]]), i = findIndex(arr, a[0], a[1], arr[b[0]]);
        //b数组放进空间
        if (l >= r) {
            let l_index = a[1], r_index = j, temp_index = temp.length - 1 - (b[1] - j);
            //从大往小
            while (r_index > i && l_index >= i) {
                if (temp[temp_index] >= arr[l_index]) {
                    arr[r_index] = temp[temp_index];
                    r_index--;
                    temp_index--;
                } else {
                    arr[r_index] = arr[l_index];
                    r_index--;
                    l_index--;
                }
            }
            //剩余元素填充
            while (temp_index >= 0) {
                arr[r_index] = temp[temp_index];
                r_index--;
                temp_index--;
            }
        } else {//a数组放进空间
            let l_index = i, r_index = b[0], temp_index = temp.length - 1 - (a[1] - i);
            //从小往大
            while (l_index < j && r_index <= j) {
                if (temp[temp_index] >= arr[r_index]) {
                    arr[l_index] = arr[r_index];
                    l_index++;
                    r_index++;
                } else {
                    arr[l_index] = temp[temp_index];
                    l_index++;
                    temp_index++;
                }
            }
            //剩余元素填充
            while (temp_index <= temp.length - 1) {
                arr[l_index] = temp[temp_index];
                l_index++;
                temp_index++;
            }
        }
    }

    /**
     * @param {Array} arr 数组
     * @param {number} l 左
     * @param {number} r 右
     * @param {number} val 目标值*/
    function insertSort(arr, l, r, val) {
        let left = findIndex(arr, l, r, val);
        while (r >= left) {
            arr[r + 1] = arr[r];
            r--;
        }
        arr[left] = val;
    }

    /**
     * @param {Array} arr 原数组
     * @param {Array} run run栈
     * @return {void}*/
    function checkRun(arr, run) {
        // debugger
        // console.log(run)
        let length = run.length;
        if (length === 0 || length === 1) return;
        let z, y, x, newRun, popRun;
        if (length === 2) {
            z = run[length - 2][1] - run[length - 2][0] + 1;
            y = run[length - 1][1] - run[length - 1][0] + 1;
            if (z > y) {
                return;
            } else {
                newRun = [run[length - 2][0], run[length - 1][1]];
                patch(arr, run[length - 2], run[length - 1]);
                run.pop();
                run[run.length - 1] = newRun;
            }
        } else {
            z = run[length - 3][1] - run[length - 3][0] + 1;
            y = run[length - 2][1] - run[length - 2][0] + 1;
            x = run[length - 1][1] - run[length - 1][0] + 1;
            if (z > y + x && y > x) {
                return;
            } else {
                if (Math.min(z, x) === z) {
                    popRun = [run[length - 1][0], run[length - 1][1]];
                    newRun = [run[length - 3][0], run[length - 2][1]];
                    patch(arr, run[length - 3], run[length - 2]);
                    run.pop();
                    run[run.length - 1] = popRun;
                    run[run.length - 2] = newRun;
                } else {
                    newRun = [run[length - 2][0], run[length - 1][1]];
                    patch(arr, run[length - 2], run[length - 1]);
                    run.pop();
                    run[run.length - 1] = newRun;
                }
                checkRun(arr, run);
            }
        }
    }

    /**
     * @param {Array} arr 原数组*/
    function TimSort(arr) {
        let length = arr.length;
        //z>y+x,y>x
        let run = [];
        if (length === 0 && length === 1) return;
        //长度小于32，直接二分插排
        if (length < 32) {
            for (let i = 1; i < length; i++) {
                if (arr[i] >= arr[i - 1]) {

                } else {
                    insertSort(arr, 0, i - 1, arr[i]);
                }
            }
            return;
        }
        //最小run
        let minRun = minRunLength(length);
        let r = 0;
        while (r < length) {
            let rest = Math.min(minRun, length - r);
            for (let i = r + 1; i < r + rest; i++) {
                if (arr[i] >= arr[i - 1]) {

                } else {
                    insertSort(arr, r, i - 1, arr[i]);
                }

            }
            // if (r !== 0) debugger
            run.push([r, r + rest - 1]);
            checkRun(arr, run);
            r += rest;
        }
        console.log(run.length)
        while (run.length > 1) {
            let newRun = [run[run.length - 2][0], run[run.length - 1][1]];
            patch(arr, run[run.length - 2], run[run.length - 1]);
            run.pop();
            run[run.length - 1] = newRun;
        }
    }

    /**生成指定长度的随机数组
     * @param {number} length  生成数组的长度
     * @param {number} min     随机值的下限
     * @param {number} max    随机值的上限
     * @return {Array} 指定长度的随机数组*/
    function generateRandomArray(length, min, max) {
        let arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return arr;
    }

    //生成随机数
    let randomArray = generateRandomArray(100000, 1, 10000);

    TimSort(randomArray);

    //检测是否是递增数组，是返回1，不是返回0
    function isIncreasingArray(arr) {
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < arr[i - 1]) {
                console.log('第' + i + '项  =' + arr[i]);
                console.log('第' + (i - 1) + '项  =' + arr[i - 1])
                return 0; // 数组不是递增的
            }
        }
        return 1; // 数组是递增的
    }
    console.log(isIncreasingArray(randomArray), randomArray)
```

