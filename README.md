# RedKit

Website độc lập gồm **23 công cụ** tạo chuỗi, chuyển đổi và kiểm tra dữ liệu. Next.js + React, JavaScript/JSX và CSS, xuất website tĩnh. Không cần dashboard, đăng nhập, API hoặc cơ sở dữ liệu.

## Cài đặt và chạy

Yêu cầu Node.js >=22.14.0 và npm.

```sh
npm ci
npm run dev
```

Mở http://localhost:3002. Trình duyệt coi localhost là ngữ cảnh an toàn để dùng Web Crypto và clipboard.

Nếu gặp `Failed to start server` kèm `EADDRINUSE`, cổng đang được dịch vụ khác sử dụng. Có thể chọn cổng khác, ví dụ `npm run dev -- --port 3003`.

## Kiểm tra

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run quality` chạy lint, unit/component test, build và browser test. Browser test cần OpenSSL, chạy bản export qua HTTPS cục bộ với chứng chỉ tự ký dùng riêng cho kiểm thử; không có backend trong sản phẩm. Playwright kiểm tra 23 công cụ, kết quả Web Crypto thực, dữ liệu không đi qua mạng/storage, trạng thái bất đồng bộ, clipboard bị từ chối, accessibility và màn hình 390–1920px.

## Build và triển khai

```sh
npm ci
npm run build
```

Upload **nội dung thư mục `out/`** lên document root của website tĩnh có **HTTPS**. Với dịch vụ build tự động: build command `npm run build`, output directory `out`. Không cần `next start`, Node server, biến môi trường hoặc database ở hosting. Không thêm proxy hoặc rewrite API từ dashboard. Bản hiện tại dùng domain root; nếu triển khai dưới đường dẫn con cần cấu hình `basePath` và build lại.

### Tạo ZIP để upload qua cPanel HawkHost

Máy build cần tiện ích `zip` (Ubuntu/Debian: `sudo apt install zip`). Chạy tại thư mục dự án:

```sh
npm run deploy:zip
```

Lệnh build trước, chỉ khi build thành công mới đóng gói nội dung `out/` vào **`releases/redkit.zip`**. ZIP chứa `index.html`, `_next/` và các tài nguyên ở gốc, không bọc thêm thư mục `out/`. Chạy lại sẽ cập nhật ZIP và loại bỏ các file không còn trong bản build. Thư mục `releases/` được bỏ qua trong Git.

Trong cPanel, mở **File Manager**, chọn document root của domain (thường là `public_html/` với domain chính), upload `redkit.zip` rồi chọn **Extract** ngay tại đó. Sau giải nén, `index.html` phải nằm trực tiếp trong document root. Xóa ZIP trên hosting và mở website qua HTTPS để kiểm tra. File trùng tên sẽ được ghi đè; file cũ chỉ có trên hosting không tự bị xóa khi giải nén. Bản build hiện tại dành cho domain root; nếu dùng thư mục con cần cấu hình `basePath` rồi build lại.

Xem bản export cục bộ với `npm run preview` tại http://127.0.0.1:4175; dừng preview trước khi chạy browser test vì dùng cùng cổng. Khi truy cập qua domain/IP khác localhost, dùng HTTPS để Web Crypto và clipboard hoạt động đúng. Nếu quyền clipboard bị từ chối, ứng dụng cho phép chọn và sao chép thủ công.

## Bộ công cụ

- Ngẫu nhiên: mật khẩu, hex token, Base64 token, UUID v4, dãy số.
- Biểu diễn: Base64 UTF-8, Base64URL, URL component, HTML entities, UTF-8 ↔ hex/nhị phân, Unicode escapes, JSON string, ROT13.
- Hash: SHA-256, SHA-384, SHA-512, SHA-1 (legacy).
- HMAC: SHA-256 và SHA-512.
- Định dạng: JSON format/minify, URL query đọc/tạo và Text case với sáu nút: lower case, UPPER CASE, Capitalized Case, aLtErNaTiNg cAsE, Title Case, InVeRsE CaSe. Text case giữ khoảng trắng/xuống dòng và hỗ trợ tiếng Việt; kiểu xen kẽ chỉ đếm chữ cái, bắt đầu chữ thường. Title Case viết hoa đầu từ nhưng giữ các từ nối tiếng Anh thường gặp ở dạng thường (trừ từ đầu/cuối).

## Dữ liệu và giới hạn

Nội dung nhập, khóa HMAC và kết quả chỉ tồn tại trong bộ nhớ trang; không lưu lịch sử, không gửi qua mạng, không có analytics. Tối đa 10.000 ký tự đầu vào, khóa HMAC 1–1.000 ký tự; từng bộ tạo có giới hạn hiển thị trên form. Nguồn ngẫu nhiên dùng Web Crypto. Hash/HMAC không phải mã hóa; Base64, ROT13 và các dạng biểu diễn không bảo vệ bí mật. SHA-1 chỉ để tương thích hệ thống cũ.

Tên thư mục `browser-tools` và vị trí cạnh dashboard chỉ là mặc định trên máy hiện tại; repo có thể clone và chạy độc lập ở thư mục khác.

Các module trong `src/features/tools/` được tách từ dashboard; không phụ thuộc đường dẫn hoặc package của dashboard. `tests/unit` giữ các vector độc lập với Node crypto, `tests/components` kiểm tra trạng thái và `tests/e2e` kiểm tra hành vi trình duyệt thật. Git đã được khởi tạo cục bộ; chưa cấu hình remote hay xuất bản.

## Ảnh chia sẻ Open Graph

Metadata dùng `public/og-image.png` (1200×630), được tạo từ artwork gốc `public/redkit-og.png`. `npm run build` tự tạo lại ảnh trước khi xuất tĩnh; `npm run deploy:zip` cũng thực hiện bước này khi tạo gói triển khai. Có thể chạy riêng `node scripts/generate-og.mjs` để xem ảnh sau khi đổi artwork. Script giữ nguyên ảnh gốc và toàn bộ nội dung, thêm nền tối ở mép nếu cần để đúng tỷ lệ.
