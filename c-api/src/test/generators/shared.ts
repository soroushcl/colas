export const generateMockLocation = (city: string = 'Toronto', province: string = "Ontario", country: string = "Canada") => {
  return {
    country,
    province,
    city,
  }
}