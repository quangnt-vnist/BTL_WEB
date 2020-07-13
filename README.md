# freelancer_website

-trc khi chạy thì chạy lệnh: npm install 
(để cài đặt package lưu trong file node_modules - nếu có rồi thì thôi)

-vào file .env để cấu hình các biến môi trường 
(db- chỉ cần phải tạo database ở bên ngoài trc ko cần tạo model, port: tùy ý, ví dụ 8000)
(link xem db online https://cloud.mongodb.com/v2/5e99784ce1b567558c1ac2c5#metrics/replicaSet/5ea69de3d2699e2ef2d02ab0/explorer/test/users/find )
-xong thì chạy: npm start

-bật trình duyệt chạy: localhost:8000 (cái port này có thể đổi trong file .env)

-------------------------------------------------------------------------------

----models: chứa các model
-
-
----public: chứa các folder images, stylesheets, javascripts (dùng css, js, img thì thêm file vào đây, xem ví dụ ở cái home.ejs khi muốn gọi đến cái css cần dùng,....)
-
-
----routes: chứa các file route
-
-
----views: chứa các file giao diện là các file .ejs (viết đc js trong html)
-
-
---- .env: chứa file config DB_CONNECT, PORT để chạy db và server
-
-
----...
