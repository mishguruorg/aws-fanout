import test from 'ava'

import uniqueConcat from './uniqueConcat'

test('should uniqueConcat no lists', (t) => {
  t.deepEqual(uniqueConcat(), [])
})

test('should uniqueConcat one list', (t) => {
  const listA = ['a', 'b', 'c']
  t.deepEqual(uniqueConcat(listA), ['a', 'b', 'c'])
})

test('should uniqueConcat two lists', (t) => {
  const listA = ['a', 'b', 'c']
  const listB = ['d', 'e', 'f']
  t.deepEqual(uniqueConcat(listA, listB), ['a', 'b', 'c', 'd', 'e', 'f'])
})

test('should remove duplicates', (t) => {
  const listA = ['a', 'b', 'c']
  const listB = ['b', 'c', 'd']
  t.deepEqual(uniqueConcat(listA, listB), ['a', 'b', 'c', 'd'])
})

test('should remove arns with wildcard flags', (t) => {
  const listA = ['a', 'b', 'c']
  const listB = ['b', 'c', 'd']
  t.deepEqual(uniqueConcat(listA, listB), ['a', 'b', 'c', 'd'])
})
