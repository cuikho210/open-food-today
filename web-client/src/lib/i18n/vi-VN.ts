import type { I18nSchema } from '.';

export const messagesViVN: I18nSchema = {
	code: 'vi-VN',
	common: {
		oops: 'Oops!!!',
		foodToday: 'Hôm Nay Ăn Gì',
		settings: 'Cài đặt',
		language: 'Ngôn ngữ',
		unexpectedError: 'Lỗi không mong muốn',
		login: 'Đăng nhập',
		loginWithGoogle: 'Tiếp tục với Google',
		loginToInteract: 'Vui lòng đăng nhập để thích và bình luận công thức',
		profile: 'Hồ sơ',
		signOut: 'Đăng xuất',
		comment: 'Bình luận',
		send: 'Gửi'
	},
	auth: {
		error: {
			title: 'Xác Thực Thất Bại',
			description:
				'Chúng tôi gặp lỗi khi đăng nhập cho bạn. Điều này có thể do mã xác thực đã hết hạn hoặc không hợp lệ, hoặc do sự cố tạm thời với dịch vụ xác thực của chúng tôi.',
			goHome: 'Về Trang Chủ'
		}
	}
};
