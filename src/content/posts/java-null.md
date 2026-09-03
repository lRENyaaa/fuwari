---
title: 为什么Java的null如此糟糕
published: 2026-09-03
description: Java 的 null 为什么如此糟糕？从 Groovy 的安全调用到 Kotlin 的可空类型，看看 Java 如何把本应由类型系统承担的空值处理，变成开发者挥之不去的心智负担。
tags: [Java, 开发, 随笔]
category: 开发
draft: false
---


Java 中的 null 已经被人们讨论了很多年，为什么我们说 Java 的 null 很糟糕？

先看一个例子。Java 运行在 JVM 上，那就拿同样运行在 JVM 上的语言 Groovy 来比较一下：

``` groovy
def length = nullable?.length // Groovy 
```
``` java
Integer length = nullable != null ? nullable.length : null; // Java
```

可以看到，Groovy 对可空值的处理很简洁：编译器会自动把字节码展开成 Java 那样的判空逻辑。而 Java 需要为每一个可空值主动补上判断，简单的赋值场景姑且还能这么做，复杂场景里就得四处塞满 null 检查，没法像 Groovy 那样优雅地写出一条可空链。这些判断层层堆叠，成了写 Java 时对 null 挥之不去的心智负担，而 Groovy 很好地减轻了这种负担。

但仅仅是简化还不够。Groovy 里不写 `?`，照样会抛出 NPE。想象一个长期维护的复杂系统：维护得足够久，疏忽就一定会发生。Groovy 可能是忘了写 `?`，Java 可能是忘了判空。简洁的语法能大大降低疏忽的概率，却无法根除它。只要依赖人，疏忽就不可避免。真正的解决方案是强制要求处理空，同样运行在 JVM 上的 Kotlin 就是最好的例子。比较一下：

``` kotlin
var length: Int? = nullable?.length // Kotlin
```
``` groovy
def length = nullable?.length // Groovy
```
``` java
Integer length = nullable != null ? nullable.length : null; // Java
```

可以看到，Kotlin 把空纳入了类型系统：在纯 Kotlin 代码里，所有可能为空的类型默认都需要处理，编译器根本不允许你直接写出 `nullable.length`。

Java 8 引入了 Optional，看起来能带来类似 Kotlin 的空安全性，但它不能解决问题，只能缓解问题，还带来了新的问题。不过本文更关注的是 null 本身，Optional 就不细说了。同样不展开的还有 Kotlin 与 Java 等其他非空安全的 JVM 语言交互时引入的 NPE。

即便在纯 Kotlin 里，你仍然可以用其他办法抛出 NPE，比如 `nullable!!.length`。但和 Java、Groovy 不同的是，写下 `!!` 这个行为本身，意味着你主动说"这里不会是空的"，这是承诺。而 Java 和 Groovy 的 NPE 不一定是承诺导致的，更多是疏忽。疏忽往往只是失误，承诺则更多是错误。

当然，你可能会想：能不能让 null 彻底不存在？你可以抹除空的载体，却无法抹除空的概念。你也可能会想：那就接受空的存在，让空静默传递就行。但只要空存在，且不被预期，无论是立即出错（如 Kotlin 或 Rust），还是静默传递（如 Objective-C），最终都会导致问题。至于该选择立即出错还是静默传递，这又是另一个话题了，在此不深入讨论。

Java 的 null 是一体两面的：它有造成"十亿美元错误"的那一面，也有真正担任"空"职责的那一面。Java 中的 NPE 让人恐惧，但同在 JVM 上运行的 Kotlin 却让人感到安心。Java 的问题不是有 null，而是只提供了一个在类型系统里显得突兀、不可操作、忘记写失败路径就会爆炸的 null。
