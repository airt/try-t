# try-t

[![Build Status][build-badge]][build-status]
[![Test Coverage][coverage-badge]][coverage-result]
[![NPM Version][npm-badge]][npm-url]

Try type in Typescript

## installation

`npm install try-t --save`

## api

For details, see [test/try-spec](https://github.com/airt/try-t/blob/develop/test/try-spec.js)

- [Try.failure](#tryfailure)
- [Try.success](#trysuccess)
- [Try.of](#tryof)
- [Try.m](#trym)
- [Try.p](#tryp)
- [Try#match](#trymatch)
- [Try#isFailure](#tryisfailure)
- [Try#isSuccess](#tryissuccess)
- [Try#get](#tryget)
- [Try#getOrElse](#trygetorelse)
- [Try#orElse](#tryorelse)
- [Try#map](#trymap)
- [Try#failed](#tryfailed)
- [Try#fold](#tryfold)
- [Try#filter](#tryfilter)
- [Try#flatMap](#tryflatmap)
- [Try#foreach](#tryforeach)
- [Try#onFailure](#tryonfailure)
- [Try#onSuccess](#tryonsuccess)
- [Try#transform](#trytransform)
- [Try#recover](#tryrecover)
- [Try#recoverWith](#tryrecoverwith)
- [Try#toArray](#trytoarray)
- [Try#toJSON](#trytojson)
- [Try#toString](#trytostring)
- [Try#[Symbol.iterator]](#trysymboliterator)

### Try.failure

```ts
Try.failure: <A = never>(error: Error) => Try<A>
```

### Try.success

```ts
Try.success: <A>(value: A) => Try<A>
```

### Try.of

```ts
Try.of: <A>(f: () => A) => Try<A>
```

### Try.m

```ts
Try.m: <A>(f: () => Try<A>) => Try<A>
```

### Try.p

```ts
Try.p: <A>(p: Promise<A>) => Promise<Try<A>>
```

### Try#match

```ts
match: <B>(matchers: { success: Fn<A, B>, failure: Fn<Error, B> }) => B
```

### Try#isFailure

```ts
isFailure: boolean
```

### Try#isSuccess

```ts
isSuccess: boolean
```

### Try#get

```ts
get: () => A
```

### Try#getOrElse

```ts
getOrElse: (other: () => A) => A
```

### Try#orElse

```ts
orElse: (other: () => Try<A>) => Try<A>
```

### Try#map

```ts
map: <B>(f: Fn<A, B>) => Try<B>
```

### Try#failed

```ts
failed: () => Try<Error>
```

### Try#fold

```ts
fold: <B>(hf: Fn<Error, B>, hs: Fn<A, B>) => B
```

### Try#filter

```ts
filter: (p: Fn<A, boolean>) => Try<A>
```

### Try#flatMap

```ts
flatMap: <B>(f: Fn<A, Try<B>>) => Try<B>
```

### Try#foreach

```ts
foreach: (f: Fn<A, void>) => void
```

### Try#onFailure

```ts
onFailure: (f: Fn<Error, void>) => Try<A>
```

### Try#onSuccess

```ts
onSuccess: (f: Fn<A, void>) => Try<A>
```

### Try#transform

```ts
transform: <B>(hs: Fn<A, Try<B>>, hf: Fn<Error, Try<B>>) => Try<B>
```

### Try#recover

```ts
recover: (f: Fn<Error, A>) => Try<A>
```

### Try#recoverWith

```ts
recoverWith: (f: Fn<Error, Try<A>>) => Try<A>
```

### Try#toArray

```ts
toArray: () => Array<A>
```

### Try#toJSON

```ts
toJSON: () => TryAsJson<A>
```

### Try#toString

```ts
toString: () => string
```

### Try#[Symbol.iterator]

```ts
[Symbol.iterator]: () => Iterator<A>
```

## references

[Try type in Scala](http://www.scala-lang.org/api/current/scala/util/Try.html)

## license

MIT

[build-badge]: https://img.shields.io/travis/airt/try-t/develop.svg
[build-status]: https://travis-ci.org/airt/try-t
[coverage-badge]: https://img.shields.io/coveralls/airt/try-t/develop.svg
[coverage-result]: https://coveralls.io/github/airt/try-t
[npm-badge]: https://img.shields.io/npm/v/try-t.svg
[npm-url]: https://www.npmjs.com/package/try-t
