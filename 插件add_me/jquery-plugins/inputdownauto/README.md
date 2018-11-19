这个插件可以应用于比较简单的输入框可实现下拉列表的功能，且可以自动提示

```js
$(输入框).inputdownauto({
    data: null, // 可以是数组也可以是html片段
    key: '', // 当data为对象数组时其要渲染的key[{key:1},{key:2}],此时必填
    blankShow: true, // 输入空白时下拉框是否全部展示(默认为true)
    autoCompleteShow: true, // 是否自动提示(默认为true)
}）
```

**data**可以为数组，或者html片段的字符串。

* 当为数组时，分为两种情况：
    + 如`[1, 2, 3]`这样的数组
    + 如`[{name: '12'}, {name: '322'}]`: 此时需要传入key（必须），选择要渲染的字段

> 此时有自动匹配的功能(`autoCompleteShow`设为`true`），
> 同时可以根据`blankShow`字段来设置在输入空白时下拉是否全部显示，也就是是否为完全的自动提示，默认为`true`，初始聚焦全部显示

* 当为html片段时，只有下拉列表的功能
