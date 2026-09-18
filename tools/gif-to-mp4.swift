// Converts a GIF to an H.264 MP4 using macOS's own AVFoundation (no ffmpeg).
// Usage: swift tools/gif-to-mp4.swift <in.gif> <out.mp4> <bgHex> <bitrate>
// Transparent pixels are flattened onto bgHex. Frames are tagged sRGB / BT.709.
// Heavily dithered GIFs (like the Trax recording) pick up a colour cast however
// high the bitrate, because compression averages the dither; ship those as GIFs.
import Foundation
import AVFoundation
import ImageIO
import CoreGraphics
import CoreVideo

let a = CommandLine.arguments
let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil)!
let n = CGImageSourceGetCount(src)
let hex = UInt32(a[3], radix: 16)!
let bg = CGColor(red: CGFloat(hex >> 16 & 255)/255, green: CGFloat(hex >> 8 & 255)/255, blue: CGFloat(hex & 255)/255, alpha: 1)
let first = CGImageSourceCreateImageAtIndex(src, 0, nil)!
let w = first.width & ~1, h = first.height & ~1
let out = URL(fileURLWithPath: a[2]); try? FileManager.default.removeItem(at: out)
let writer = try! AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: w, AVVideoHeightKey: h,
  AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2, AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2, AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2],
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: Int(a[4])!, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel]])
input.expectsMediaDataInRealTime = false
let ad = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: w, kCVPixelBufferHeightKey as String: h])
writer.add(input); writer.startWriting(); writer.startSession(atSourceTime: .zero)

func delay(_ i: Int) -> Double {
  let p = CGImageSourceCopyPropertiesAtIndex(src, i, nil) as? [CFString: Any]
  let g = p?[kCGImagePropertyGIFDictionary] as? [CFString: Any]
  var d = (g?[kCGImagePropertyGIFUnclampedDelayTime] as? Double) ?? 0
  if d < 0.011 { d = (g?[kCGImagePropertyGIFDelayTime] as? Double) ?? 0.1 }
  return d < 0.011 ? 0.1 : d
}
var t = 0.0
for i in 0..<n {
  let img = CGImageSourceCreateImageAtIndex(src, i, nil)!
  while !input.isReadyForMoreMediaData { usleep(2000) }
  var pb: CVPixelBuffer?; CVPixelBufferPoolCreatePixelBuffer(nil, ad.pixelBufferPool!, &pb)
  CVPixelBufferLockBaseAddress(pb!, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: w, height: h, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
  ctx.setFillColor(bg); ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
  ctx.draw(img, in: CGRect(x: 0, y: h - img.height, width: img.width, height: img.height))
  CVPixelBufferUnlockBaseAddress(pb!, [])
  CVBufferSetAttachment(pb!, kCVImageBufferColorPrimariesKey, kCVImageBufferColorPrimaries_ITU_R_709_2, .shouldPropagate)
  CVBufferSetAttachment(pb!, kCVImageBufferTransferFunctionKey, kCVImageBufferTransferFunction_sRGB, .shouldPropagate)
  CVBufferSetAttachment(pb!, kCVImageBufferYCbCrMatrixKey, kCVImageBufferYCbCrMatrix_ITU_R_709_2, .shouldPropagate)
  CVBufferSetAttachment(pb!, kCVImageBufferCGColorSpaceKey, CGColorSpace(name: CGColorSpace.sRGB)!, .shouldPropagate)
  ad.append(pb!, withPresentationTime: CMTime(seconds: t, preferredTimescale: 600))
  t += delay(i)
}
// hold the last frame for its own delay
input.markAsFinished(); writer.endSession(atSourceTime: CMTime(seconds: t, preferredTimescale: 600))
let sem = DispatchSemaphore(value: 0); writer.finishWriting { sem.signal() }; sem.wait()
print(a[2], n, "frames", String(format: "%.1fs", t), writer.status == .completed ? "ok" : "FAILED \(String(describing: writer.error))")
