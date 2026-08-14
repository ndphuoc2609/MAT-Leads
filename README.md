# Hyundai Lead Flow

# Prompt Lovable: Meta Lead Distribution Dashboard

Tạo một dashboard web responsive bằng tiếng Việt cho đội vận hành leads ô tô Hyundai. Đây là UI demo tương tác, dùng dữ liệu giả, không cần tích hợp Meta API hoặc backend thật.

## Mục tiêu

Theo dõi toàn bộ luồng lead từ Meta Lead Ads đến Call Center, trạng thái xử lý, và phân bổ về đại lý. Thiết kế hiện đại kiểu vận hành nội bộ: nền xanh xám rất nhạt, surface trắng, navy đậm, xanh dương làm màu hành động chính; gọn, nhiều khoảng thở, không dùng card lồng card.

## Bố cục

- Header nền navy/xanh dương:

  - Eyebrow: `META ADS · HYUNDAI LEADS`

  - Tiêu đề: `Hyundai Lead Operations`

  - Góc phải: trạng thái live, thời gian cập nhật và nút icon `Làm mới`.

- Toolbar ngay dưới header:

  - Bộ chọn thời gian: Hôm nay, 7 ngày, 30 ngày.

  - Bộ lọc trạng thái lead.

  - Ô tìm kiếm theo tên, số điện thoại hoặc đại lý.

- Hàng KPI đầu trang gồm 4 card cùng kích thước, có icon nhỏ:

  - `Leads từ Meta`: 62

  - `Cuộc gọi đã gọi`: 48

  - `Cuộc gọi thành công`: 31

  - `Đại lý đã nhận lead`: 12

  - Có số phụ nhỏ thể hiện thay đổi trong ngày.

## Luồng lead chính

Tạo khu vực workflow trực quan theo chiều dọc, có mũi tên/connector mảnh để thể hiện lead đi qua các bước:

1. `Leads mới từ Meta`

   - Danh sách lead mới nhất ở bên trái hoặc full-width trên cùng.

   - Mỗi row: tên khách, số điện thoại đã che một phần, mẫu xe quan tâm, thời điểm nhận, nguồn campaign và badge `Mới`.

   - Có counter `62 leads`.

   - Chỉ hiển thị 6 row, có nút `Xem tất cả`.

2. `Call Center`

   - Một tab/khối trung tâm rõ ràng với các trạng thái `Chờ gọi`, `Đang gọi`, `Đã liên hệ`, `Không liên hệ được`.

   - Hiển thị danh sách ngắn các lead đang được xử lý, nhân viên phụ trách và thời gian gọi gần nhất.

   - Có progress nhẹ: `48 / 62 leads đã gọi`.

3. `Leads đã xử lý`

   - Danh sách các lead hoàn tất, gồm kết quả xử lý: `Đủ điều kiện`, `Hẹn lái thử`, `Không quan tâm`, `Không liên hệ được`.

   - Row có tên lead, trạng thái, nhân viên xử lý và thời gian hoàn tất.

   - `Đủ điều kiện` và `Hẹn lái thử` dùng badge xanh lá nhạt; trạng thái không thành công dùng vàng/xám nhẹ.

## Animation mô phỏng

- Khi bấm nút `Mô phỏng lead mới`, thêm một lead vào đầu danh sách Meta.

- Lead card thu nhỏ và animate theo đường dọc xuống khối `Call Center`.

- Khi chọn xử lý xong một lead trong Call Center, animate card sang `Leads đã xử lý`.

- Sau khi lead được đánh dấu `Đủ điều kiện` hoặc `Hẹn lái thử`, animate một indicator nhỏ xuống khu vực đại lý.

- Animation nhanh, mượt, 500-700ms, dùng transform và opacity; không được làm layout nhảy hoặc gây rối khi có nhiều lead.

- Có nút `Tạm dừng mô phỏng` để dừng autoplay.

## Khu vực đại lý

Đặt dưới workflow với tiêu đề `Đại lý vừa nhận lead`.

- Hiển thị đúng 5 đại lý có lần nhận lead gần nhất, không phải 5 đại lý có nhiều lead nhất.

- Mỗi đại lý là một card trắng gọn:

  - Tên đại lý Hyundai.

  - Thời điểm nhận gần nhất.

  - Badge số lead vừa nhận.

  - Bên dưới tên đại lý hiển thị 2-3 lead mới được phân bổ: tên, xe quan tâm, thời gian nhận.

- Ví dụ đại lý: Hyundai Đông Đô, Hyundai Gia Định, Hyundai Long Biên, Hyundai Trường Chinh, Hyundai Bình Dương.

- Có link hành động phụ `Xem lead` trong mỗi row, không dùng button quá nổi.

## Dữ liệu giả

Dùng 62 lead giả có các trường: id, tên khách, số điện thoại, xe quan tâm, campaign, thời gian nhận, trạng thái call center, nhân viên xử lý, đại lý được phân bổ và thời gian phân bổ. Dùng các mẫu xe Hyundai như Creta, Accent, Tucson, Santa Fe, Venue và Palisade.

## Thiết kế và responsive

- Desktop ưu tiên khả năng quét nhanh dữ liệu, container tối đa khoảng 1440px.

- Card radius 12px, border mảnh, shadow rất nhẹ; không dùng gradient trang trí trong nội dung.

- Dùng icon quen thuộc cho Meta lead, điện thoại, thành công, đại lý, refresh, tìm kiếm và filter.

- Typography rõ cấp bậc: KPI lớn, tiêu đề section vừa, metadata nhỏ muted.

- Mobile chuyển các khu vực thành một cột; lead row không tràn ngang; animation vẫn hoạt động nhưng đơn giản hơn.

- Có empty state, loading skeleton và trạng thái không có kết quả tìm kiếm.

## Kiểm tra

- Các số KPI, counter và danh sách cập nhật nhất quán khi chạy mô phỏng.

- Lead chỉ xuất hiện ở một stage tại một thời điểm.

- Sau khi chuyển thành công sang đại lý, lead hiển thị dưới đúng đại lý nhận gần nhất.

- Không hiển thị quá 5 đại lý trong khu vực đại lý.

- UI hoạt động tốt ở desktop và mobile.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://meta-joy-leads.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/35c5601c-59c3-44cb-9d12-e031f25e3d58).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
