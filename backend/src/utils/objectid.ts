import { isValidObjectId } from "mongoose"

export const isObjectIDValid = (id: string) => {
    isValidObjectId(id)
}