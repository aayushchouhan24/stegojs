import { decodeUtf8, readByte } from "./Utils"

export function encodeImage_LSB(src, txt, callback) {
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

export function decodeImage_LSB(src, callback) {
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

export function encodeAudio_LSB(audioSource, text, callback) {
    if (text.length > (audioSource.length / 8) - 5) throw new Error('Text too long to encode in the audio source.')
    const binaryText = String(text.length).padStart(5, '0') + text.split('').map((char) => char.charCodeAt(0).toString(2).padStart(8, '0')).join('')
    const encodedAudio = audioSource.slice()
    for (let i = 0; i < binaryText.length; i++) encodedAudio[i * 8] = (encodedAudio[i * 8] & 0xFE) | binaryText[i]
    callback(encodedAudio)
}

export function decodeAudio_LSB(encodedAudio, callback) {
    let binaryText = ''
    for (let i = 0; i < encodedAudio.length; i += 8) binaryText += (encodedAudio[i] & 0x01).toString()
    const data = binaryText.match(/.{8}/g).map((bin) => String.fromCharCode(parseInt(bin, 2))).join('')
    const decodedText = data.slice(5, 5 + parseInt(data.slice(0, 5), 10))
    callback(decodedText)
}
