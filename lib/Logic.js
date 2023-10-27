import { decodeUtf8, readByte } from "./Utils"

export function encode_LSB_Stenography(src, txt, callback) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = src
    img.onload = function () {
        canvas.height = img.height
        canvas.width = img.width
        ctx.drawImage(img, 0, 0, img.width, img.height)
        const clampedArray = ctx.getImageData(0, 0, canvas.width, canvas.height)
        readByte(new TextEncoder().encode(txt), clampedArray)
        canvas.getContext('2d').putImageData(clampedArray, 0, 0)
        callback(canvas.toDataURL("image/png"))
    }
}

export function decode_LSB_Stenography(src, callback) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = src
    img.onload = function () {
        canvas.height = img.height
        canvas.width = img.width
        ctx.drawImage(img, 0, 0, img.width, img.height)
        const loadView = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let totalLength = 0
        let lastIndex

        for (let b = 0, viewLength = loadView.data.length; b < viewLength; b++) {
            if (loadView.data[b] === 255) {
                totalLength += loadView.data[b]
                if (loadView.data[b + 1] < 255) {
                    totalLength += loadView.data[b + 1]
                    lastIndex = b + 1
                    break
                }
            } else {
                totalLength += loadView.data[b]
                lastIndex = b
                break
            }
        }
        console.info('Total length: ' + totalLength + ', Last Index: ' + lastIndex)
        const secretLength = totalLength
        const newUint8Array = new Uint8Array(totalLength / 4)
        let j = 0

        for (let i = (lastIndex + 1); i < secretLength; i = i + 4) {
            const aShift = (loadView.data[i] & 3)
            const bShift = (loadView.data[i + 1] & 3) << 2
            const cShift = (loadView.data[i + 2] & 3) << 4
            const dShift = (loadView.data[i + 3] & 3) << 6
            const result = (((aShift | bShift) | cShift) | dShift)
            newUint8Array[j] = result
            j++
        }
        callback(decodeUtf8(newUint8Array))
    }
}

