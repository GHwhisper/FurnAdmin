function deepClone(obj) {    // 对象深度拷贝
    let _obj = JSON.stringify(obj),
        objClone = JSON.parse(_obj)
    return objClone
}

export {
    deepClone
}