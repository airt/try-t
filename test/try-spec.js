import test from 'ava'
import Try from '../lib/try'

const error = new Error('e')

const errorB = new Error('eb')

const value = 'v'

const valueB = 'vb'

const createFailure = () => Try.failure(error) // as Try<string>

const createSuccess = () => Try.success(value)

test('Try.failure', t => {
  const failure = createFailure()
  t.is(failure.constructor.name, 'Failure')
})

test('Try.success', t => {
  const success = createSuccess()
  t.is(success.constructor.name, 'Success')
})

test('Try.of', t => {
  const failure = Try.of(() => { throw error })
  const success = Try.of(() => value)

  t.is(failure.constructor.name, 'Failure')
  t.is(success.constructor.name, 'Success')
})

test('Try.m', t => {
  const mt = Try.of(() => '')

  const resultOfM = Try.m(() => mt)
  const resultOfMWithThrows = Try.m(() => { throw errorB })

  t.is(resultOfM, mt)

  t.true(resultOfMWithThrows.isFailure)
  t.is(resultOfMWithThrows.failed().get(), errorB)
})

test('Try.p', async t => {
  const resultOfPReject = await Try.p(Promise.reject(errorB))

  const resultOfPResolve = await Try.p(Promise.resolve(valueB))

  t.true(resultOfPReject.isFailure)
  t.is(resultOfPReject.failed().get(), errorB)

  t.true(resultOfPResolve.isSuccess)
  t.is(resultOfPResolve.get(), valueB)
})

test('Try#match', t => {
  const failure = createFailure()
  const success = createSuccess()

  const resultOfMatchF = failure.match({
    success: x => {
      t.fail()
      return valueB
    },
    failure: e => {
      t.is(e, error)
      return valueB
    },
  })

  const resultOfMatchS = success.match({
    success: x => {
      t.is(x, value)
      return valueB
    },
    failure: e => {
      t.fail()
      return valueB
    },
  })

  t.is(resultOfMatchF, valueB)
  t.is(resultOfMatchS, valueB)
})

test('Try#isFailure', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.true(failure.isFailure)
  t.is(failure.constructor.name, 'Failure')

  t.false(success.isFailure)
  t.not(success.constructor.name, 'Failure')
})

test('Try#isSuccess', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.false(failure.isSuccess)
  t.not(failure.constructor.name, 'Success')

  t.true(success.isSuccess)
  t.is(success.constructor.name, 'Success')
})

test('Try#get', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.is(t.throws(() => failure.get()), error)

  t.notThrows(() => success.get())
  t.is(success.get(), value)
})

test('Try#getOrElse', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.is(failure.getOrElse(() => 'other'), 'other')
  t.is(success.getOrElse(() => 'other'), value)
})

test('Try#orElse', t => {
  const failure = createFailure()
  const success = createSuccess()

  const another = Try.of(() => '')

  t.is(failure.orElse(() => another), another)
  t.is(success.orElse(() => another), success)
})

test('Try#map', t => {
  const failure = createFailure()
  const success = createSuccess()

  const resultOfMapF = failure.map(x => {
    t.fail()
    return valueB
  })

  const resultOfMapS = success.map(x => {
    t.is(x, value)
    return valueB
  })

  const resultOfMapWithThrowsS = success.map(x => {
    t.is(x, value)
    throw errorB
  })

  t.is(resultOfMapF, failure)

  t.true(resultOfMapS.isSuccess)
  t.is(resultOfMapS.get(), valueB)

  t.true(resultOfMapWithThrowsS.isFailure)
  t.is(resultOfMapWithThrowsS.failed().get(), errorB)
})

test('Try#failed', t => {
  const failure = createFailure()
  const success = createSuccess()

  const resultOfFailedF = failure.failed()

  const resultOfFailedS = success.failed()

  t.true(resultOfFailedF.isSuccess)
  t.is(resultOfFailedF.get(), error)

  t.true(resultOfFailedS.isFailure)
  t.true(resultOfFailedS.failed().get().message.includes('failed'))
})

test('Try#fold', t => {
  const failure = createFailure()
  const success = createSuccess()

  const resultOfFoldF = failure.fold(
    e => {
      t.is(e, error)
      return valueB
    },
    x => {
      t.fail()
      return valueB
    },
  )

  const resultOfFoldS = success.fold(
    e => {
      t.fail()
      return valueB
    },
    x => {
      t.is(x, value)
      return valueB
    },
  )

  const resultOfFoldWithThrowsS = success.fold(
    e => {
      t.is(e, errorB)
      return valueB
    },
    x => {
      t.is(x, value)
      throw errorB
    },
  )

  t.is(resultOfFoldF, valueB)
  t.is(resultOfFoldS, valueB)
  t.is(resultOfFoldWithThrowsS, valueB)
})

test('Try#filter', t => {
  const failure = createFailure()
  const success = createSuccess()

  const resultOfFilterF = failure.filter(x => {
    t.fail()
    return true
  })

  const resultOfFilterReturnsTrueS = success.filter(x => {
    t.is(x, value)
    return true
  })

  const resultOfFilterReturnsFalseS = success.filter(x => {
    t.is(x, value)
    return false
  })

  const resultOfFilterWithThrowsS = success.filter(x => {
    t.is(x, value)
    throw errorB
  })

  t.is(resultOfFilterF, failure)
  t.is(resultOfFilterReturnsTrueS, success)

  t.true(resultOfFilterReturnsFalseS.isFailure)
  const { message } = resultOfFilterReturnsFalseS.failed().get()
  t.is(message, `predicate does not hold for ${value}`)

  t.true(resultOfFilterWithThrowsS.isFailure)
  t.is(resultOfFilterWithThrowsS.failed().get(), errorB)
})

test('Try#flatMap', t => {
  const failure = createFailure()
  const success = createSuccess()

  const another = Try.of(() => '')

  const resultOfFlatMapF = failure.flatMap(x => {
    t.fail()
    return another
  })

  const resultOfFlatMapS = success.flatMap(x => {
    t.is(x, value)
    return another
  })

  const resultOfFlatMapWithThrowsS = success.flatMap(x => {
    t.is(x, value)
    throw errorB
  })

  t.is(resultOfFlatMapF, failure)
  t.is(resultOfFlatMapS, another)

  t.true(resultOfFlatMapWithThrowsS.isFailure)
  t.is(resultOfFlatMapWithThrowsS.failed().get(), errorB)
})

test('Try#foreach', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.plan(1)

  failure.foreach(x => {
    t.fail()
  })

  success.foreach(x => {
    t.is(x, value)
  })
})

test('Try#onFailure', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.plan(3)

  const resultOfOnFailureF = failure.onFailure(e => {
    t.is(e, error)
  })

  const resultOfOnFailureS = success.onFailure(e => {
    t.fail()
  })

  t.is(resultOfOnFailureF, failure)
  t.is(resultOfOnFailureS, success)
})

test('Try#onSuccess', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.plan(3)

  const resultOfOnSuccessF = failure.onSuccess(x => {
    t.fail()
  })

  const resultOfOnSuccessS = success.onSuccess(x => {
    t.is(x, value)
  })

  t.is(resultOfOnSuccessF, failure)
  t.is(resultOfOnSuccessS, success)
})

test('Try#transform', t => {
  const failure = createFailure()
  const success = createSuccess()

  const another = Try.of(() => '')

  const resultOfTransformF = failure.transform(
    x => {
      t.fail()
      return another
    },
    e => {
      t.is(e, error)
      return another
    },
  )

  const resultOfTransformS = success.transform(
    x => {
      t.is(x, value)
      return another
    },
    e => {
      t.fail()
      return another
    },
  )

  const resultOfTransformWithThrowsF = failure.transform(
    x => {
      t.fail()
      return another
    },
    e => {
      t.is(e, error)
      throw errorB
    },
  )

  const resultOfTransformWithThrowsS = success.transform(
    x => {
      t.is(x, value)
      throw errorB
    },
    e => {
      t.fail()
      return another
    },
  )

  t.is(resultOfTransformF, another)
  t.is(resultOfTransformS, another)

  t.true(resultOfTransformWithThrowsF.isFailure)
  t.is(resultOfTransformWithThrowsF.failed().get(), errorB)

  t.true(resultOfTransformWithThrowsS.isFailure)
  t.is(resultOfTransformWithThrowsS.failed().get(), errorB)
})

test('Try#recover', t => {
  const failure = createFailure()
  const success = createSuccess()

  const resultOfRecoverF = failure.recover(e => {
    t.is(e, error)
    return valueB
  })

  const resultOfRecoverWithThrowsF = failure.recover(e => {
    t.is(e, error)
    throw errorB
  })

  const resultOfRecoverS = success.recover(e => {
    t.fail()
    return valueB
  })

  t.true(resultOfRecoverF.isSuccess)
  t.is(resultOfRecoverF.get(), valueB)

  t.true(resultOfRecoverWithThrowsF.isFailure)
  t.is(resultOfRecoverWithThrowsF.failed().get(), errorB)

  t.is(resultOfRecoverS, success)
})

test('Try#recoverWith', t => {
  const failure = createFailure()
  const success = createSuccess()

  const another = Try.of(() => '')

  const resultOfRecoverWithF = failure.recoverWith(e => {
    t.is(e, error)
    return another
  })

  const resultOfRecoverWithWithThrowsF = failure.recoverWith(e => {
    t.is(e, error)
    throw errorB
  })

  const resultOfRecoverWithS = success.recoverWith(e => {
    t.fail()
    return another
  })

  t.is(resultOfRecoverWithF, another)

  t.true(resultOfRecoverWithWithThrowsF.isFailure)
  t.is(resultOfRecoverWithWithThrowsF.failed().get(), errorB)

  t.is(resultOfRecoverWithS, success)
})

test('Try#toArray', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.deepEqual(failure.toArray(), [])

  t.deepEqual(success.toArray(), [value])
})

test('Try#toJSON', t => {
  const failure = createFailure()
  const success = createSuccess()

  const strip = s => s.replace(/\n\s+/g, '').replace(/:\s/g, ':')

  const failureString = strip(`{
    "type": "failure",
    "success": false,
    "payload": {
      "name": "${error.name}",
      "message": "${error.message}"
    }
  }`)

  const successString = strip(`{
    "type": "success",
    "success": true,
    "payload": "${value}"
  }`)

  t.is(JSON.stringify(failure), failureString)
  t.is(JSON.stringify(success), successString)
})

test('Try#toString', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.is(failure.toString(), `Failure(${error.name}: ${error.message})`)
  t.is(success.toString(), `Success(${value})`)
})

test('Try#[Symbol.iterator]', t => {
  const failure = createFailure()
  const success = createSuccess()

  t.plan(1)

  for (const x of failure) {
    t.fail()
  }

  for (const x of success) {
    t.is(x, value)
  }
})
