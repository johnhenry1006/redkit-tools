<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- setup-agent-team:begin -->
## Agent team workflow

- Agent chính điều phối và được phép chủ động giao các nhiệm vụ có phạm vi rõ cho subagent phù hợp; không khởi chạy mọi vai trò cho mọi việc. Giữ các bước phụ thuộc chạy tuần tự.
- Đọc hướng dẫn áp dụng và `docs/agent-team.md`; truyền các đường dẫn này, phạm vi và tiêu chí hoàn thành trong mỗi lần giao việc, không truyền bí mật.
- Giữ stack Next.js/React, JavaScript/JSX và CSS, xuất tĩnh; dùng lệnh/cwd đã ghi nhận. Không tự suy ra backend hay chuyển sang TypeScript.
- Giao quyền sở hữu file rõ ràng cho tác vụ ghi; không cho hai agent sửa cùng file đồng thời. Chỉ dùng worktree khi phù hợp và khả dụng; tích hợp kết quả trước khi kiểm tra cuối.
- Thay đổi hành vi đáng kể cần review độc lập và kiểm thử thực. Không hạ tiêu chuẩn hoặc sửa test để che lỗi. Agent không tự duyệt thay đổi quy tắc quản trị trong tác vụ sản phẩm.
- Tuân thủ sandbox, mạng, approval và giới hạn công cụ của host. Hướng dẫn repo không phải cơ chế cách ly. Không đưa thông tin xác thực vào mã, log, prompt hay báo cáo.
- Tự chọn mặc định hợp lý, có thể hoàn tác; chỉ hỏi khi thiếu thông tin thiết yếu hoặc quyền cần thiết. Không xuất bản, chi tiền, xóa dữ liệu hay thay production khi chưa được phép.
- Tối đa ba chu kỳ sửa cho cùng lỗi chưa giải quyết; sau đó đánh giá lại và báo trở ngại. Không lặp vô hạn hoặc tuyên bố thành công thiếu bằng chứng.
- Trước bàn giao, kiểm tra nội dung tích hợp cuối và nêu các check bắt buộc. Thay đổi sản phẩm cần check bắt buộc PASS và xử lý phát hiện chặn. Với setup, ghi rõ check thiếu là NOT CONFIGURED/BLOCKED; không coi là PASS.
<!-- setup-agent-team:end -->
