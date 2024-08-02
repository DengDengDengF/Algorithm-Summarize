```js
 /**思考1:
  这是个nlogn算法
  但是js的 sort() 可以对10的6次方个1 进行排序，
  我这个会慢一点，我认为是patch函数 
  temp[temp_index] >= arr[l_index],依次类推...
  执行到这里,永远都不会执行galopingmode,
  接下来bug修改就是更改条件后执行....
  */
 /**
  思考2：
  转念一想，我在选取i、j范围的时候，在重复的情况下，大量的冗余，
  于是修改二分的条件，实现10的六次方个1排序，在nlogN算法下
  */
  /**
  https://awdesh.medium.com/timsort-fastest-sorting-algorithm-for-real-world-problems-1d194f36170e
  博客园写的就是一坨屎，我估计作者都不懂，驴唇不对马嘴
  我这个版本的"gallop  version of ldf",直接二分查找位置。
  官方版的"gallop",先运行mingallop次，然后再指数查找。
  我这个版本有可能尽在眼前，但是还需要不断地二分。
  官方版本，就是为了避免无效的二分，设置了mingallop，这也是mingallop作用。
  */
  

   /**run的数量是2的幂次方效率最高
     * @param {number} n
     * @return {number}*/
    function minRunLength(n) {
        let r = 0;
        while (n >= 64) {
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
            if (arr[m] >= val) {
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

        //a的末尾在b的位置，b的开头在a的位置，之所以这么写，因为数组是从下标是从a到b的
        let j = findIndex(arr, b[0], b[1], arr[a[1]]), i = findIndex(arr, a[0], a[1], arr[b[0]]);
        //取一个长度小的放进临时空间
        temp = l < r ? arr.slice(i, a[1] + 1) : arr.slice(b[0], j + 1);


        let min_gallop = 3;
        let count_gallop = 0;
        if (l >= r) {  //b数组放进空间
            // debugger
            let l_index = a[1], r_index = j, temp_index = temp.length - 1;
            //从大往小
            while (r_index > i && l_index >= i && temp_index >= 0) {
                if (temp[temp_index] >= arr[l_index]) {
                    arr[r_index] = temp[temp_index];
                    count_gallop = 0;
                    r_index--;
                    temp_index--;
                } else {
                    arr[r_index] = arr[l_index];
                    count_gallop++;
                    r_index--;
                    l_index--;
                    if (count_gallop === min_gallop) {//gallopMode
                        // debugger
                        // console.log('gallop')
                        let index = findIndex(arr, i, l_index, temp[temp_index]);
                        if (arr[index] > temp[temp_index]) {
                            while (l_index >= index) {
                                arr[r_index] = arr[l_index];
                                r_index--;
                                l_index--;
                            }
                        }

                    }

                }
            }
            //剩余元素填充
            while (temp_index >= 0) {
                arr[r_index] = temp[temp_index];
                r_index--;
                temp_index--;
            }
        } else {//a数组放进空间
            let l_index = i, r_index = b[0], temp_index = 0;
            //从小往大
            while (l_index < j && r_index <= j && temp_index <= temp.length - 1) {
                if (temp[temp_index] >= arr[r_index]) {
                    arr[l_index] = arr[r_index];
                    count_gallop++;
                    l_index++;
                    r_index++;
                    if (count_gallop === min_gallop) {//gallopMode
                        // debugger
                        // console.log('gallop')
                        let index = findIndex(arr, r_index, j, temp[temp_index]);
                        if (arr[index] < temp[temp_index]) {
                            while (r_index <= index) {
                                arr[l_index] = arr[r_index];
                                l_index++;
                                r_index++;
                            }
                        }
                    }
                } else {
                    arr[l_index] = temp[temp_index];
                    count_gallop = 0;
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
        //长度小于64，直接二分插排
        if (length < 64) {
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
            run.push([r, r + rest - 1]);
            checkRun(arr, run);
            r += rest;
        }
        // console.log(run.length)
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
    let randomArray = generateRandomArray(1000000, 1, 1);

    TimSort(randomArray);
    // randomArray.sort((a,b)=>a-b)
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

以下图片，需要开启梯子

![png](https://miro.medium.com/v2/resize:fit:1400/format:webp/0*kKOGmSKlJk_gJ_13.jpeg)
