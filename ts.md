[TOC]



## 1.安装

```js
npm install -g typescript
tsc -v
tsc index.ts
node index.js


npm install -g ts-node
ts-node index.ts

idea安装 run configuration for typescript
运行失败因为没有tsconfig.json 然后 tsc --init;
```

## 2.any 、unknow、never

#### 2.1any污染问题

```js
let x: any = "hello";
let y: number;

y = x; // 不报错  any是最顶层，它可以赋值给其他任何类型的变量（因为没有类型检查），导致其他变量出错。

y * 123; // 不报错
y.toFixed(); // 不报错
```

#### 2.2unknown 类型解决污染问题

```js
let v: unknown = 123;

let v1: boolean = v; // 报错 变量v是unknown类型，赋值给any和unknown以外类型的变量都会报错，这就避免了污染问题，从而克服了any类型的一大缺点。
let v2: number = v; // 报错
```

不能直接调用unknow类型方法和属性

```js
let v1: unknown = { foo: 123 };
v1.foo; // 报错

let v3: unknown = (n = 0) => n + 1;
v3(); // 报错
```

使用unknow类型变量，要做类型缩小

```js
let a: unknown = 1;

if (typeof a === "number") {
  let r = a + 10; // 正确
}
```

#### 2.3 never

该类型为空，不包含任何值。

空集(never)是任何集合(number、string、boolean ...)的子集。

```js
function f(): never {
  throw new Error("Error");
}

let v1: number = f(); // 不报错
let v2: string = f(); // 不报错
let v3: boolean = f(); // 不报错
```

## 3.ts类型

#### 3.1值类型

```js
// x 的类型是 "https"
const x = "https";

// y 的类型是 string
const y: string = "https";

// x 的类型是 { foo: number }
const x = { foo: 1 };
```

#### 3.2联合类型、交叉类型

 联合

```js
let name: string | null;

name = "John";
name = null;
```

交叉

```js
let obj: { foo: string } & { bar: string };

obj = {
  foo: "hello",
  bar: "world",
};
```

#### 3.3type

`type`命令用来定义一个类型的别名。

```js
type Age = number;

let age: Age = 55;
```

## 4.数组

```js
let arr: number[] = [1, 2, 3];
let arr1: (number | string)[]=[1,2,3,4,"1"];
let arr2: Array<number> = [1, 2, 3];
let arr3: Array<number | string>;
let arr4: Array<number | string>=[1,2,"1"];
数组成员可以动态变化
```

#### 4.1只读数组，const断言

```js
const arr = [0, 1];
arr[1] = 2; 
arr.push(3); 
delete arr[0]; 


const arr: readonly number[] = [0, 1];
//const arr: ReadonlyArray<number> = [0, 1];
//const arr: Readonly<number[]> = [0, 1];

arr[1] = 2; // 报错
arr.push(3); // 报错
delete arr[0]; // 报错



number[] 是 readonly number[]的子类型
let a1: number[] = [0, 1];
let a2: readonly number[] = a1; // 正确 

a1 = a2; // 报错 父赋值给子报错了，子功能比父多，


const arr = [0, 1] as const;//as const告诉 TypeScript，推断类型时要把变量arr推断为只读数组，从而使得数组成员无法改变。
arr[0] = [2]; // 报错
```

## 5.元组

成员类型可以自由设置的数组，即数组的各个成员的类型可以不同。

```js
const s: [string, string, boolean] = ["a", "b", true];

// a 的类型为 (number | boolean)[] 推断称数组了
let a = [1, true];

//添加问号后缀（?），表示该成员是可选的。
let a: [number, number?] = [1];
       

let x: [string, string] = ["a", "b"];
x[2] = "c"; // 报错  元组限制成员数量

//用扩展运算，可以不限制成员数量
type NamedNums = [string, ...number[]];
const a: NamedNums = ["A", 1, 2];
const b: NamedNums = ["B", 1, 2, 3];

```

只读元组

```js
// 写法一
type t = readonly [number, string];

// 写法二
type t = Readonly<[number, string]>;
```

成员数量推断

```js
function f(point: [number, number]) {
  if (point.length === 3) {// TypeScript 推断发现元组point的长度是2,编译器报错。
    // 报错
    // ...
  }
}


const myTuple: [...string[]] = ["a", "b", "c"];//用了扩展运算符，TypeScript 就无法推断出成员数量
if (myTuple.length === 4) {
  // 正确
  // ...
}
```

## 6.Symbol

unique symbol 类型是 symbol 类型的子类型，所以可以将前者赋值给后者，但是反过来就不行。

```js
const a: unique symbol = Symbol();

const b: symbol = a; // 正确

const c: unique symbol = b; // 报错
```

## 7.函数

箭头函数

```ts
const repeat = (str: string, times: number): string => str.repeat(times);
```

可选参数

```ts
function f(x?: number) {
  return x;
}

f(undefined); // 正确
```

参数默认值

```ts
function createPoint(x: number = 0, y: number = 0): [number, number] {
  return [x, y];
}

createPoint(); // [0, 0]
```

参数解构

```ts
type ABC = { a: number; b: number; c: number };

function sum({ a, b, c }: ABC) {
  console.log(a + b + c);
}
```

rest参数

```ts
// rest 参数为数组
function joinNumbers(...nums: number[]) {
  // ...
}

// rest 参数为元组
function f(...args: [boolean, number]) {
  // ...
}
```

readonly

```ts
function arraySum(arr: readonly number[]) {
  // ...
  arr[0] = 0; // 报错
}
```

void

```ts
function f(): void {
  return 123; // 报错
}
```

never

```ts
function fail(msg: string): never {
  throw new Error(msg);
}
```

局部类型

```ts
function hello(txt: string) {
  type message = string;
  let newTxt: message = "hello " + txt;
  return newTxt;
}

const newTxt: message = hello("world"); // 报错
```

高阶函数

```ts
(someValue: number) => (multiplier: number) => someValue * multiplier;
```

重载 java中的Override

```ts
function reverse(str: string): string;  
function reverse(arr: any[]): any[];
function reverse(stringOrArray: string | any[]): string | any[] {
  if (typeof stringOrArray === "string")
    return stringOrArray.split("").reverse().join("");
  else return stringOrArray.slice().reverse();
}
```

构造函数

```ts
class Animal {
  numLegs: number = 4;
}

type AnimalConstructor = new () => Animal; //构造函数

function create(c: AnimalConstructor): Animal {
  return new c();
}

const a = create(Animal);//类（class）本质上是构造函数
```

## 8.ts对象类型

属性名索引

```ts
type MyObj = {
  [property: string]: string;
};

const obj: MyObj = {
  foo: "a",
  bar: "b",
  baz: "c",
};
```

解构赋值

```ts
const {
  id,
  name,
  price,
}: {
  id: string;
  name: string;
  price: number;
} = product;
```

兼容性

```ts
const B = {
  x: 1,
  y: 1,
};

const A: { x: number } = B; // 正确
```

严格字面量检查

```ts
const point: {
  x: number;
  y: number;
} = {
  x: 1,
  y: 1,
  z: 1, // 报错
};
```

空对象

```
const pt0 = {};
const pt1 = { x: 3 };
const pt2 = { y: 4 };

const pt = {
  ...pt0,
  ...pt1,
  ...pt2,
};
```

## 9.interface接口

设计理念和java类似。

interface可以继承

```ts
interface Shape {
  name: string;
}

interface Circle extends Shape {
  radius: number;
}
```

interface可以合并

```ts
interface Box {
  height: number;
  width: number;
}

interface Box {
  length: number;
}
```

interface和type异同

（1）`type`能够表示非对象类型，而`interface`只能表示对象类型（包括数组、函数等）。

```ts
type a=number;
let c:a=1;

interface A{
     a:number
}
```

（2）`interface`可以继承其他类型，`type`不支持继承。

```ts
interface Animal {
  name: string;
}
//interface继承
interface Bear extends Animal {
  honey: boolean;
}

type a={a:number};
type b=string | a; //type的方式“继承”
let c:b="{a:1}";
```

## 10.class

属性

```ts
class Point {
  x: number;
  y: number;
}
```

readonly

```ts
class A {
  readonly id = "foo";
}

const a = new A();
a.id = "bar"; // 报错
```

方法类型

```ts
class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

存取器

```ts
class C {
  _name = "";
  get name(): string {
    return this._name;
  }
  set name(value: number | string) {
    this._name = String(value); // 正确
  }
}
```

属性索引

```ts
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);
  // get(s: string) {
  //     return this[s] as boolean;
  // }
   get= (s: string) =>{
         return this[s] as boolean;
   } 
}
```

interface

```ts
interface Point {
  x: number;
  y: number;
}

class MyPoint implements Point {
  x = 1;
  y = 1;
  z: number = 1;
}
```

实例类型

```ts
class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
//方式1
function createPoint(PointClass: typeof Point, x: number, y: number): Point {
  return new PointClass(x, y);
}
//方式2
function createPoint(
  PointClass: new (x: number, y: number) => Point,
  x: number,
  y: number
): Point {
  return new PointClass(x, y);
}
//方式3
interface PointConstructor {
  new (x: number, y: number): Point;
}

function createPoint(
  PointClass: PointConstructor,
  x: number,
  y: number
): Point {
  return new PointClass(x, y);
}
```

泛型类

```ts
class Box<Type> {
  contents: Type;

  constructor(value: Type) {
    this.contents = value;ts
  }
}

const b: Box<string> = new Box("hello!");
```

抽象类

```ts
abstract class A {
  abstract execute(): string;
}

class B extends A {
  execute() {
    return `B executed`;
  }
}
```

## 11.泛型

函数泛型

```ts
function id<T>(arg: T): T {
  return arg;
}
```

接口泛型

```ts
interface Box<Type> {
  contents: Type;
}

let box: Box<string>;
```

类泛型

```ts
class Pair<K, V> {
  key: K;
  value: V;
}
```

类别名泛型

```ts
type Nullable<T> = T | undefined | null;
```

参数默认

```ts
class Generic<T = string> {
  list: T[] = [];

  add(t: T) {
    this.list.push(t);
  }
}
```

数组泛型

```ts
let arr: Array<number> = [1, 2, 3];
```

约束

```ts
function comp<T extends { length: number }>(a: T, b: T) {
  if (a.length >= b.length) { //避免没length情况
    return a;
  }
  return b;
}
```

少用泛型、泛型参数越少越好、
