export function readByte(secret, clampedArray) {
    let index = 0
    let k = 0
    for (let i = 0, length = secret.length; i < length; i++) {
        if (i === 0) {
            const secretLength = length * 4
            console.info('Secret Length(' + length + 'x4): ' + secretLength)
            if (secretLength > 255) {
                const division = secretLength / 255
                if (division % 1 === 0) {
                    for (k = 0; k < division; k++) {
                        clampedArray.data[k] = 255
                        index++
                    }
                } else {
                    const firstPortion = division.toString().split(".")[0]
                    const secondPortion = division.toString().split(".")[1]
                    for (k = 0; k < firstPortion; k++) {
                        clampedArray.data[k] = 255
                        index++
                    }
                    const numberLeft = Math.round((division - firstPortion) * 255)
                    console.info('numberLeft: ' + numberLeft)
                    clampedArray.data[k] = numberLeft
                    index++
                }
            } else {
                clampedArray.data[0] = secretLength
                index++
            }
        }

        const asciiCode = secret[i]
        const first2bit = (asciiCode & 0x03)
        const first4bitMiddle = (asciiCode & 0x0C) >> 2
        const first6bitMiddle = (asciiCode & 0x30) >> 4
        const first8bitMiddle = (asciiCode & 0xC0) >> 6
        replaceByte(first2bit)
        replaceByte(first4bitMiddle)
        replaceByte(first6bitMiddle)
        replaceByte(first8bitMiddle)
    }
    function replaceByte(bits) {
        clampedArray.data[index] = (clampedArray.data[index] & 0xFC) | bits
        index++
    }
}

export function decodeUtf8(arrayBuffer) {
    let result = ""
    let i = 0
    let c = 0
    let c1 = 0
    let c2 = 0
    const data = new Uint8Array(arrayBuffer)

    if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
        i = 3
    }

    while (i < data.length) {
        c = data[i]
        if (c < 128) {
            result += String.fromCharCode(c)
            i++
        } else if (c > 191 && c < 224) {
            if (i + 1 >= data.length) {
                throw "UTF-8 Decode failed. Two byte character was truncated."
            }
            c2 = data[i + 1]
            result += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
            i += 2
        } else {
            if (i + 2 >= data.length) {
                throw "UTF-8 Decode failed. Multi byte character was truncated."
            }
            c2 = data[i + 1]
            c3 = data[i + 2]
            result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
            i += 3
        }
    }
    return result
}