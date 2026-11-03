# إعداد لوحة إدارة Batsho

الملفات الجديدة: `index.html` (اللوحة)، `admin-setup.sql`، `supabase/functions/admin-push/index.ts`.

## 1) قاعدة البيانات
افتح Supabase ← SQL Editor، والصق محتوى `admin-setup.sql` ثم Run. يضيف جدول سجل الإشعارات وصلاحيات المدير على الباقات وحسابات الدفع، ولا يغيّر شيئًا موجودًا.

## 2) دالة إرسال الإشعارات
```bash
supabase functions deploy admin-push --project-ref whjyruxlcxgwivyuntub
supabase secrets set --project-ref whjyruxlcxgwivyuntub \
  VAPID_PUBLIC_KEY=BJsSBMu_WY6o0YpLdbOsZfwsKCFX_boNPga5AVwkH0hGTTBTnAyOkUIPQoOZzX7VaHlVWkicvhU2lHrZUbK0B8A \
  VAPID_PRIVATE_KEY=<المفتاح الخاص الذي ولّدته مع المفتاح العام> \
  VAPID_SUBJECT=mailto:<بريدك>
```
- المفتاح الخاص يجب أن يكون الزوج المطابق للمفتاح العام الموجود في التطبيق (`VAPID_PUBLIC` في index.html). إن لم يتطابقا لن تصل الإشعارات.
- الدالة تفترض أن اشتراكات الأجهزة في جدول `push_subscriptions` بالأعمدة `endpoint, p256dh, auth, user_id`. إن كان اسم جدولك مختلفًا (انظر تعريف `save_push` بالاستعلام التشخيصي في أعلى ملف SQL) أضف سرًّا: `PUSH_TABLE=اسم_الجدول`.

## 3) رفع اللوحة
استبدل `index.html` في مستودع `Batsho-admin` بالنسخة الجديدة وارفعه كالمعتاد.

## ملاحظات
- **قبول الشحن** يستخدم الدالتين الموجودتين `approve_order` و`reject_order`. لإرسال إشعار للمستخدم بعد القرار يجب أن يُرجع `admin_orders` الحقل `user_id`؛ إن لم يكن موجودًا يتم القرار بنجاح لكن بدون إشعار.
- الإشعارات تصل فقط للأجهزة التي فعّلت «الإشعارات خارج التطبيق». الحسابات الأخرى تحتاج صندوق إشعارات داخل التطبيق، والسجل `announcements` جاهز لذلك.
