import { isValidPassword, isEmpty, isValidSelfIntro } from "./validations"

describe("check password strength", () => {
  test("success", () => {
    const passwordWithNumber = "password1"
    expect(isValidPassword(passwordWithNumber)).toEqual(true)
  })
  test("failure", () => {
    const passwordWithoutNumber = "password"
    expect(isValidPassword(passwordWithoutNumber)).toEqual(false)

    const shortPasswordWithNumber = "pass1"
    expect(isValidPassword(shortPasswordWithNumber)).toEqual(false)
  })
})

describe("isEmpty", () => {
  test("true", () => {
    const blankValue = ""
    expect(isEmpty(blankValue)).toEqual(true)

    const nullValue = null
    expect(isEmpty(nullValue)).toEqual(true)
  })
  test("false", () => {
    const value = "hoge"
    expect(isEmpty(value)).toEqual(false)
  })
})

describe("isValidSelfIntro", () => {
  test("true", () => {
    const character160 =
      "testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest"
    expect(isValidSelfIntro(character160)).toEqual(true)
  })
  test("false", () => {
    const character161 =
      "testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttestt"
    expect(isValidSelfIntro(character161)).toEqual(false)
  })
})
