export const toQueryString = (itemList, additionalParams) => {
  const params = new URLSearchParams()
  itemList.forEach((item, index) => {
    Object.keys(item).forEach((key) => {
      params.append(`ItemList[${index}][${key}]`, item[key])
    })
  })

  Object.keys(additionalParams).forEach((key) => {
    params.append(key, additionalParams[key])
  })

  return params.toString()
}
