const uniqueConcat = (...arns: string[][]) => {
  return [...new Set([...arns.flat()])]
}

export default uniqueConcat
