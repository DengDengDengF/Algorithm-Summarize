let db;
const queues = new Map();

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('myDatabase', 1);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore('myStore', {keyPath: 'url'});
        };
    });
};
const executeQueue = async (key) => {
    const queue = getQueue(key);
    if (queue.executing) return;
    queue.executing = true;
    while (queue.writes.length > 0 || queue.reads.length > 0) {
        // 执行所有写操作
        while (queue.writes.length > 0) {
            const {task, resolve, reject} = queue.writes.shift();
            try {
                const result = await task();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }

        // 执行一个读操作，然后检查是否有新的写操作
        if (queue.reads.length > 0) {
            const {task, resolve, reject} = queue.reads.shift();
            try {
                const result = await task();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }
    }
    queue.executing = false;
};

const getQueue = (key) => {
    if (!queues.has(key)) {
        queues.set(key, {writes: [], reads: [], executing: false});
    }
    return queues.get(key);
};

const setData = (key, value) => {
    return new Promise((resolve, reject) => {
        const queue = getQueue(key);
        queue.writes.push({
            task: () => new Promise((res, rej) => {
                const tx = db.transaction('myStore', 'readwrite');
                const store = tx.objectStore('myStore');
                const req = store.put({url: key, value});
                req.onsuccess = () => res(req.result);
                req.onerror = () => rej(req.error);
            }),
            resolve,
            reject
        });
        executeQueue(key);
    });
};

const getData = (key) => {
    return new Promise((resolve, reject) => {
        const queue = getQueue(key);
        queue.reads.push({
            task: () => new Promise((res, rej) => {
                const tx = db.transaction('myStore', 'readonly');
                const store = tx.objectStore('myStore');
                const req = store.get(key);
                req.onsuccess = () => res(req.result?.value);
                req.onerror = () => rej(req.error);
            }),
            resolve,
            reject
        });
        executeQueue(key);
    });
};

export {initDB, getData, setData};