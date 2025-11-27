# Biểu đồ Sequence - Vô hiệu hóa/Kích hoạt Người dùng

## Mô tả chức năng
Chức năng cho phép Admin vô hiệu hóa hoặc kích hoạt tài khoản người dùng trong hệ thống EnTalk. Khi tài khoản bị vô hiệu hóa, người dùng sẽ không thể đăng nhập và sử dụng ứng dụng.

## Actors
- **Admin**: Quản trị viên hệ thống
- **Admin Frontend**: Giao diện quản trị (React)
- **Backend API**: Server xử lý logic
- **AdminAuth Middleware**: Middleware xác thực admin
- **Database**: MySQL database

---

## Sequence Diagram - Vô hiệu hóa User

```mermaid
sequenceDiagram
    participant Admin
    participant AdminUI as Admin Frontend<br/>(UserList.js)
    participant API as Backend API<br/>(admin.js)
    participant Auth as AdminAuth<br/>Middleware
    participant Controller as AdminController<br/>(adminController.js)
    participant DB as MySQL Database