export interface TryAsJson<A> {
  type: string
  success: boolean
  payload: A | Pick<Error, 'name' | 'message'>
}

export type Fn<A, B> = (x: A) => B

export type Fn2<A, B, C> = (a: A) => (b: B) => C

export default abstract class Try<A> implements Iterable<A> {

  abstract isFailure: boolean

  abstract isSuccess: boolean

  abstract get: () => A

  abstract getOrElse: (other: () => A) => A

  abstract orElse: (other: () => Try<A>) => Try<A>

  abstract map: <B>(f: Fn<A, B>) => Try<B>

  abstract failed: () => Try<Error>

  abstract fold: <B>(hf: Fn<Error, B>, hs: Fn<A, B>) => B

  abstract filter: (p: Fn<A, boolean>) => Try<A>

  abstract flatMap: <B>(f: Fn<A, Try<B>>) => Try<B>

  abstract foreach: (f: Fn<A, void>) => void

  abstract onFailure: (f: Fn<Error, void>) => Try<A>

  abstract onSuccess: (f: Fn<A, void>) => Try<A>

  abstract transform: <B>(hs: Fn<A, Try<B>>, hf: Fn<Error, Try<B>>) => Try<B>

  abstract recover: (f: Fn<Error, A>) => Try<A>

  abstract recoverWith: (f: Fn<Error, Try<A>>) => Try<A>

  abstract toArray: () => Array<A>

  abstract toJSON: () => TryAsJson<A>

  abstract toString: () => string

  static failure = <A = never>(error: Error): Try<A> => new Failure<A>(error)

  static success = <A>(value: A): Try<A> => new Success<A>(value)

  static of = <A>(f: () => A): Try<A> => {
    try {
      return Try.success(f())
    } catch (e) {
      return Try.failure(e)
    }
  }

  static m = <A>(f: () => Try<A>): Try<A> => {
    try {
      return f()
    } catch (e) {
      return Try.failure(e)
    }
  }

  static p = <A>(p: Promise<A>): Promise<Try<A>> =>
    p.then(Try.success).catch(Try.failure)

  // static join = <A>(t: Try<Try<A>>): Try<A> =>
  //   t.flatMap(x => x)

  match = <B>(matchers: { success: Fn<A, B>, failure: Fn<Error, B> }): B =>
    this.fold(matchers.failure, matchers.success)

  ;[Symbol.iterator] = (): Iterator<A> => this.toArray()[Symbol.iterator]()

}

class Failure<A> extends Try<A> {

  isFailure = true

  isSuccess = false

  constructor(private readonly error: Error) { super() }

  get = (): A => { throw this.error }

  getOrElse = (other: () => A): A => other()

  orElse = (other: () => Try<A>): Try<A> => other()

  map = <B>(f: Fn<A, B>): Try<B> => this.asTryB<B>()

  failed = (): Try<Error> => Try.success(this.error)

  fold = <B>(hf: Fn<Error, B>, hs: Fn<A, B>): B => hf(this.error)

  filter = (p: Fn<A, boolean>): Try<A> => this

  flatMap = <B>(f: Fn<A, Try<B>>): Try<B> => this.asTryB<B>()

  foreach = (f: Fn<A, void>): void => (void 0)

  onFailure = (f: Fn<Error, void>): Try<A> => { f(this.error); return this }

  onSuccess = (f: Fn<A, void>): Try<A> => this

  transform = <B>(hs: Fn<A, Try<B>>, hf: Fn<Error, Try<B>>): Try<B> =>
    Try.m(() => hf(this.error))

  recover = (f: Fn<Error, A>): Try<A> =>
    Try.of(() => f(this.error))

  recoverWith = (f: Fn<Error, Try<A>>): Try<A> =>
    Try.m(() => f(this.error))

  toArray = (): Array<A> => []

  toJSON = (): TryAsJson<A> => ({
    type: 'failure',
    success: false,
    payload: {
      name: this.error.name,
      message: this.error.message,
    },
  })

  toString = () => `Failure(${this.error.name}: ${this.error.message})`

  private asTryB = <B>() => this as any as Try<B>

}

class Success<A> extends Try<A> {

  isFailure = false

  isSuccess = true

  constructor(private readonly value: A) { super() }

  get = (): A => this.value

  getOrElse = (other: () => A): A => this.value

  orElse = (other: () => Try<A>): Try<A> => this

  map = <B>(f: Fn<A, B>): Try<B> => Try.of(() => f(this.value))

  failed = (): Try<Error> => Try.failure(new Error('failed of success'))

  fold = <B>(hf: Fn<Error, B>, hs: Fn<A, B>): B => {
    try { return hs(this.value) } catch (e) { return hf(e) }
  }

  filter = (p: (x: A) => boolean): Try<A> =>
    this.flatMap(x =>
      p(x) ? this : Try.failure(new Error(`predicate does not hold for ${this.value}`)),
    )

  flatMap = <B>(f: Fn<A, Try<B>>): Try<B> =>
    Try.m(() => f(this.value))

  foreach = (f: Fn<A, void>): void => f(this.value)

  onFailure = (f: Fn<Error, void>): Try<A> => this

  onSuccess = (f: Fn<A, void>): Try<A> => { f(this.value); return this }

  transform = <B>(hs: Fn<A, Try<B>>, hf: Fn<Error, Try<B>>): Try<B> =>
    this.flatMap(hs)

  recover = (f: Fn<Error, A>): Try<A> => this

  recoverWith = (f: Fn<Error, Try<A>>): Try<A> => this

  toArray = (): Array<A> => [this.value]

  toJSON = (): TryAsJson<A> => ({
    type: 'success',
    success: true,
    payload: this.value,
  })

  toString = () => `Success(${this.value})`

}
