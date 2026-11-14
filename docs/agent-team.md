# Đội agent cho Browser Tools

## Phạm vi và lựa chọn

Thiết lập cho dự án hiện tại; không cài công cụ, đổi dependency, sửa sản phẩm, deploy hoặc đổi cấu hình Codex toàn cục. Vai trò suy ra lần đầu: **coder, reviewer, tester, designer, security**. Có UI nên thêm designer; mật khẩu, token, khóa HMAC và dữ liệu đầu vào cần security. Không có role cũ hoặc role ngoài lựa chọn cần bảo toàn. Lựa chọn này định hướng điều phối, không giới hạn danh sách agent mà host có thể tìm thấy.

Git đã tồn tại nhưng chưa có HEAD; toàn bộ file ban đầu chưa được track. Không tạo commit hay khởi tạo lại Git. Giữ nguyên phần Next.js tự sinh trong `AGENTS.md`. Không có override khác ở root, hướng dẫn cấp cha có nội dung hay fallback tùy chỉnh trong cấu hình được kiểm tra; `AGENTS.md` là file root có hiệu lực.

## Stack và kiến trúc

| Thành phần/cwd | Stack | Bằng chứng |
| --- | --- | --- |
| Frontend, `.` | Next.js 16.4.5, React/React DOM 19.3.0, JavaScript ES modules/JSX, CSS thuần | `package.json`, `src/app/`, `src/features/tools/`, `src/app/globals.css` |
| Xuất tĩnh, `.` | `output: 'export'`, `trailingSlash`, output `out/` | `next.config.mjs`, `README.md` |
| Toolchain, `.` | Node >=22.14.0; npm, `package-lock.json`; không có packageManager field hoặc lockfile cạnh tranh | `package.json`, `package-lock.json`; máy kiểm tra Node 22.14.0, npm 10.9.2 |
| Kiểm thử, `.` | ESLint, Vitest, Testing Library, Playwright Chromium, axe | cấu hình `eslint`, `vitest`, `playwright`; `tests/` |
| Backend/database | NOT APPLICABLE: không có backend sản phẩm; HTTPS server chỉ là harness local | `README.md`, `tests/support/https-static.mjs` |

Giữ JavaScript/JSX; thông báo TypeScript trong build Next.js không phải bằng chứng nguồn TypeScript. Không thêm Tailwind, UI kit, API, đăng nhập hoặc database. Lệnh dev: `npm run dev` tại `.` và http://localhost:3002. Cổng 3001 đang dùng bởi Docker; không dừng dịch vụ khác để lấy cổng. Preview: `npm run preview`, cổng 4175; không chạy cùng browser test.

## Check matrix và bằng chứng

Mọi cwd là `.` (root dự án). Đã đọc scripts/lifecycle hooks và kiểm tra các binary local trước khi chạy; không có hook cài đặt ở manifest root. Dùng npm đã có, không dùng npx/dlx hoặc cài thiếu tự động. Nguồn/config được nhận diện bằng SHA-256 tổng hợp đường dẫn và hash từng file theo thứ tự, loại `AGENTS.md` và cây vendor/generated: `7e887ed9c8cd99609cc565e5b4ad3d995af74c4e8eb61363ce3dd4b6393bd137`. Đây là baseline trước setup, không phải Git revision.

| Mục đích | Lệnh chính xác | Điều kiện | Trạng thái/exit |
| --- | --- | --- | --- |
| Lint | `npm run lint` → `eslint . --max-warnings=0` | binary local đã có | PASS, 0 |
| Unit/component | `npm test` → `vitest run` | dependency local đã có | PASS, 0; 55 tests, 2 files |
| Static build | `npm run build` → `next build --webpack` | Next.js local | PASS, 0; export các route tĩnh |
| Browser/a11y/privacy/responsive | `npm run test:e2e` → `playwright test` | build `out/`, Chromium đã có, OpenSSL; cổng 4175 trống | PASS, 0; 3 tests, 5 viewport; HTTPS chỉ local |
| Typecheck riêng | Không có script/nguồn TS | JavaScript/JSX | NOT APPLICABLE |
| Dependency/secret scanner chuyên dụng | Không có check được cấu hình | cần quyết định/cấp quyền riêng nếu bổ sung | NOT CONFIGURED; không chạy remote audit |
| TOML/state/ownership/idempotence | Python `tomllib`, SHA-256 và so sánh intended writes | Python có sẵn | PASS: 5 TOML parse/schema, mọi hash sở hữu và phần Next.js ban đầu khớp; dry-run không có intended write; 24 file baseline khác không đổi |

Không gọi `npm ci` hay lệnh cài browser trong setup. Nếu thiếu dependency/browser, báo BLOCKED và bàn giao lệnh đề xuất; không tự cài. `npm run quality` là chuỗi của bốn check trên; đã chạy từng check để ghi kết quả riêng. Kết quả PASS không chứng minh không có lỗ hổng.

## Điều phối và sở hữu

| Vai trò | Phạm vi và đầu ra |
| --- | --- |
| Agent chính | Chia việc, chọn check, cấp ownership từng file, tích hợp, giải quyết xung đột, kiểm tra cuối và báo cáo |
| coder | Logic `src/features/tools/`, app và test được giao; thay đổi tối thiểu, bằng chứng kiểm thử |
| designer | Component UI/CSS được giao; tiêu chí UX, accessibility, trạng thái và responsive; tuần tự nếu trùng file với coder |
| reviewer | Chỉ đọc theo hướng dẫn; diff/nội dung thực, mức độ, đường dẫn, bằng chứng; PASS/CHANGES REQUIRED/BLOCKED |
| tester | Chạy check an toàn đã xem xét; cần ownership trước sửa test; trả lệnh/cwd/exit/phạm vi chưa kiểm tra |
| security | Chỉ đọc theo hướng dẫn; Web Crypto, rendering, privacy, dependency; phát hiện và giới hạn bằng chứng |

Reviewer/security không có sandbox read-only riêng do các file này tạo ra. Agent chính không giao toàn bộ quyền sửa repo một cách ngầm định. Những việc tài liệu/build nhỏ do vai trò chính xử lý; không thêm specialist tự động. Không tự duyệt thay đổi quản trị trong tác vụ sản phẩm.

## Quy tắc mã và bảo mật chung

- Theo style tại file hiện có: ESM, JavaScript/JSX, CSS thường; component tương tác dùng client boundary đúng chỗ. ESLint Next core-web-vitals là cấu hình thực, không thêm formatter hoặc viết lại hàng loạt.
- Trước khi sửa API/framework, đọc tài liệu tương ứng tại `node_modules/next/dist/docs/` theo hướng dẫn Next.js ở root. Giữ phiên bản lockfile; nâng dependency chỉ khi được giao.
- Dữ liệu nhập, khóa và kết quả ở bộ nhớ trình duyệt; không analytics, gửi mạng, history hay storage. Dùng dữ liệu giả trong test. Không đọc `.env`/credential store hoặc in secret. Review mọi dependency và ranh giới I/O mới.
- Giữ xác thực input/action, giới hạn độ dài/số lượng, xử lý Unicode, kết quả bất đồng bộ và lỗi rõ ràng. Render input như text qua React; không HTML thực thi/eval. Không có query/database hiện tại; nếu thêm phải được cấp phạm vi và review injection/auth riêng.
- Dùng Web Crypto cho randomness/hash/HMAC; không thay bằng Math.random. Giữ yêu cầu secure context, clipboard fallback, nhãn SHA-1 legacy và giải thích hash/encoding không phải mã hóa bí mật. Không ghi khóa HMAC vào lỗi.
- Không publish, deploy, migration, xóa dữ liệu, scan từ xa hay thao tác production trong setup. Quyền chuyên môn không cấp thêm quyền phê duyệt.

## Governance, quyền thực thi và cổng hoàn thành

**Hướng dẫn agent:** file root và role TOML là hướng dẫn hành vi. **Check:** các công cụ local đã cài/chạy như bảng; chưa cấu hình CI/release gate hoặc scanner chuyên dụng. **Host/OS:** phiên này áp dụng workspace-write, mạng hạn chế và auto-review cho escalation; không thay đổi giới hạn hay settings toàn cục. Shell sandbox đang gặp lỗi `bwrap ... Failed RTM_NEWADDR: Operation not permitted`; các check shell đã đi qua cơ chế phê duyệt sẵn có, không sửa sandbox. Reviewer chỉ đọc theo hướng dẫn không phải khóa file; prefix rules và local checks không phải firewall/release gate không thể bỏ qua.

Khuyến nghị phiên local: `codex --sandbox workspace-write --ask-for-approval on-request` tại root, hoặc tiếp tục chế độ managed do host quy định. Không dùng bypass, không thêm model pin/permission override vào role. Nếu cần enforcement khi phát hành, bổ sung CI và protected checks được quản trị độc lập trong một tác vụ được cấp phép.

Thay đổi logic/UI cần check liên quan thực tế; thay đổi ảnh hưởng toàn ứng dụng cần lint, unit/component, static build và browser check PASS, review độc lập và xử lý phát hiện chặn. Không giảm assertion, severity, compiler/security policy để có kết quả xanh. Không sửa sản phẩm để chữa check có sẵn trong tác vụ setup. Sau ba chu kỳ sửa cùng lỗi, đánh giá lại và báo blocker. Không xem tool thiếu là PASS.

## Runtime và cách dùng

Đã phát hiện Codex CLI 0.169.0, multi_agent được bật trong cấu hình hiện có. Role standalone dùng đúng ba field bắt buộc `name`, `description`, `developer_instructions` theo [tài liệu Codex chính thức](https://developers.openai.com/codex/subagents); không ghi legacy registration hay config toàn cục. Kiểm tra cú pháp TOML tách biệt với runtime loading.

Smoke test delegation chỉ đọc: **PASS**, một subagent đã kiểm tra độc lập cấu trúc 5 role, hashes, stack và governance, không sửa file. Lint cuối sau setup cũng PASS (exit 0). Kiểm tra này truyền nhiệm vụ reviewer thủ công; không xác nhận role loader.

Runtime tự discovery năm role mới: **UNVERIFIED trong phiên hiện tại**. API spawn của phiên này chỉ nhận task_name, không có tham số chọn custom role; bounded subagent review có thể kiểm tra delegation nhưng không chứng minh role tự được load. Mở phiên Codex mới ở root để discovery. Nếu host không hỗ trợ role standalone, agent chính truyền nguyên nội dung role và đường dẫn policy trong nhiệm vụ hữu hạn qua công cụ delegation đang có, vẫn giữ quyền host.

Smoke test phiên mới: “Đọc AGENTS.md và docs/agent-team.md. Gọi reviewer chỉ đọc để xác nhận stack, 5 role, lệnh kiểm tra và ownership hashes; không sửa file hoặc cài gì. Báo rõ role được load hay chỉ là nhiệm vụ được truyền thủ công.”

Sau đó có thể giao tác vụ sản phẩm cụ thể, ví dụ: “Cải thiện thông báo khi Web Crypto không khả dụng; phân công coder, reviewer và tester phù hợp, giữ dữ liệu cục bộ.” Đây là workflow theo yêu cầu, không có dịch vụ agent 24/7. File được chuẩn bị và check trên workspace hiện tại; không chứng nhận cài đặt hoặc runtime trên máy Ubuntu khác không kết nối.

## Quản lý lần chạy lại

`.codex/agent-team-state.json` lưu version, vai trò và SHA-256 byte UTF-8 của role/report/managed section. Chỉ cập nhật role/report còn khớp hash sở hữu. Bảo toàn role lạ, khóa state lạ và nội dung AGENTS ngoài marker. Marker trùng/lỗi hoặc state hỏng là conflict. File do người sửa không được tự ghi đè; nêu đề xuất trong bàn giao. Đầu ra giống nhau phải giữ nguyên, không thêm timestamp hoặc đường dẫn tuyệt đối vào state. Không đổi manifest, lockfile hay source trong setup.
