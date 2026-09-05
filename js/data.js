/**
 * js/data.js
 * Authoritative Question Bank & Game Catalogs for "Meow Meow Ôn Viên Chức"
 * Topics: Luật Viên Chức & Luật Cán Bộ, Công Chức
 * Zero external dependencies. Browser and Node.js compatible.
 */

const DATA = {
  topics: [
    {
      id: "luat_vc",
      name: "Luật Viên Chức",
      icon: "📜",
      description: "Luật Viên chức số 58/2010/QH12 & Luật sửa đổi bổ sung số 52/2019/QH14"
    },
    {
      id: "luat_cbcc",
      name: "Luật Cán Bộ, Công Chức",
      icon: "⚖️",
      description: "Luật Cán bộ, công chức số 22/2008/QH12 & Luật sửa đổi bổ sung số 52/2019/QH14"
    }
  ],

  questions: [
    // ═══════════════════════════════════════════════════════════════════════
    // CHỦ ĐỀ 1: LUẬT VIÊN CHỨC (topicId: "luat_vc") — 12 câu hỏi
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "q_luatvc_001",
      topicId: "luat_vc",
      difficulty: 1,
      concept: "Khái niệm 'Viên chức' theo Luật Viên chức 2010 được hiểu như thế nào?",
      definition: "Là công dân Việt Nam được tuyển dụng theo vị trí việc làm, làm việc tại đơn vị sự nghiệp công lập theo chế độ hợp đồng làm việc, hưởng lương từ quỹ lương của đơn vị sự nghiệp công lập theo quy định của pháp luật.",
      quizOptions: [
        "Là công dân Việt Nam được bầu cử, phê chuẩn giữ chức vụ theo nhiệm kỳ trong cơ quan nhà nước",
        "Là công dân Việt Nam được tuyển dụng theo vị trí việc làm, làm việc tại đơn vị sự nghiệp công lập theo chế độ hợp đồng làm việc",
        "Là công dân Việt Nam được bổ nhiệm vào ngạch công chức trong biên chế nhà nước",
        "Là người lao động làm việc theo hợp đồng lao động tại các doanh nghiệp nhà nước"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ Điều 2 Luật Viên chức 2010: Viên chức làm việc tại đơn vị sự nghiệp công lập theo chế độ hợp đồng làm việc và hưởng lương từ quỹ lương đơn vị.",
      sortItems: null,
      tags: ["khái niệm", "định nghĩa"]
    },
    {
      id: "q_luatvc_002",
      topicId: "luat_vc",
      difficulty: 1,
      concept: "Theo Luật Viên chức 2010, có bao nhiêu nguyên tắc trong hoạt động nghề nghiệp của viên chức?",
      definition: "Có 04 nguyên tắc: 1. Tuân thủ pháp luật; 2. Tận tụy phục vụ nhân dân; 3. Tuân thủ quy trình, quy chuẩn chuyên môn; 4. Chịu sự thanh tra, kiểm tra, giám sát của cơ quan có thẩm quyền và nhân dân.",
      quizOptions: [
        "03 nguyên tắc",
        "04 nguyên tắc",
        "05 nguyên tắc",
        "06 nguyên tắc"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ Điều 5 Luật Viên chức 2010 quy định 04 nguyên tắc trong hoạt động nghề nghiệp của viên chức.",
      sortItems: null,
      tags: ["nguyên tắc", "nghề nghiệp"]
    },
    {
      id: "q_luatvc_003",
      topicId: "luat_vc",
      difficulty: 1,
      concept: "Nguyên tắc nào sau đây KHÔNG phải là nguyên tắc quản lý viên chức theo Luật Viên chức 2010?",
      definition: "Nguyên tắc 'Tận tụy phục vụ nhân dân' thuộc nhóm nguyên tắc trong hoạt động nghề nghiệp (Điều 5), không phải nguyên tắc quản lý viên chức (Điều 6).",
      quizOptions: [
        "Bảo đảm sự lãnh đạo của Đảng Cộng sản Việt Nam",
        "Bảo đảm quyền chủ động và đề cao trách nhiệm của người đứng đầu đơn vị sự nghiệp công lập",
        "Tuyển dụng, sử dụng, quản lý dựa trên tiêu chuẩn chức danh nghề nghiệp và kết quả công việc",
        "Tận tụy phục vụ nhân dân, có tinh thần phối hợp công tác"
      ],
      quizAnswer: 3,
      explanation: "Căn cứ Điều 6 Luật Viên chức 2010: Quản lý viên chức gồm 4 nguyên tắc: Lãnh đạo của Đảng; Quyền chủ động người đứng đầu; Tiêu chuẩn chức danh; Bình đẳng giới. 'Tận tụy phục vụ nhân dân' thuộc Điều 5.",
      sortItems: null,
      tags: ["nguyên tắc", "quản lý"]
    },
    {
      id: "q_luatvc_004",
      topicId: "luat_vc",
      difficulty: 2,
      concept: "Theo Luật sửa đổi 2019, hợp đồng làm việc xác định thời hạn áp dụng cho viên chức tuyển dụng từ ngày 01/7/2020 có thời hạn bao lâu?",
      definition: "Có thời hạn từ đủ 12 tháng đến 60 tháng.",
      quizOptions: [
        "Từ đủ 12 tháng đến 36 tháng",
        "Từ đủ 06 tháng đến 36 tháng",
        "Từ đủ 12 tháng đến 60 tháng",
        "Từ đủ 24 tháng đến 60 tháng"
      ],
      quizAnswer: 2,
      explanation: "Căn cứ khoản 2 Điều 2 Luật sửa đổi 2019 (sửa Điều 25 Luật Viên chức 2010), hợp đồng làm việc xác định thời hạn có thời gian từ đủ 12 tháng đến 60 tháng.",
      sortItems: null,
      tags: ["hợp đồng", "thời hạn"]
    },
    {
      id: "q_luatvc_005",
      topicId: "luat_vc",
      difficulty: 2,
      concept: "Theo Điều 19 Luật Viên chức 2010, hành vi nào sau đây viên chức KHÔNG được thực hiện?",
      definition: "Trốn tránh trách nhiệm, thoái thác công việc hoặc nhiệm vụ được giao; gây bè phái, mất đoàn kết; tự ý bỏ việc; tham gia đình công.",
      quizOptions: [
        "Ký hợp đồng vụ, việc với cơ quan khác ngoài giờ làm việc nếu pháp luật không cấm",
        "Góp vốn nhưng không tham gia quản lý, điều hành công ty trách nhiệm hữu hạn",
        "Trốn tránh trách nhiệm, tự ý bỏ việc, tham gia đình công",
        "Tham gia giảng dạy và nghiên cứu khoa học ngoài giờ"
      ],
      quizAnswer: 2,
      explanation: "Căn cứ khoản 1 Điều 19 Luật Viên chức 2010, viên chức tuyệt đối không được trốn tránh trách nhiệm, tự ý bỏ việc hoặc tham gia đình công.",
      sortItems: null,
      tags: ["nghĩa vụ", "cấm kỵ"]
    },
    {
      id: "q_luatvc_006",
      topicId: "luat_vc",
      difficulty: 2,
      concept: "Luật Viên chức 2010 quy định các hình thức kỷ luật đối với viên chức KHÔNG giữ chức vụ quản lý gồm những hình thức nào?",
      definition: "Gồm 03 hình thức: Khiển trách, Cảnh cáo, Buộc thôi việc (hình thức Cách chức chỉ áp dụng cho viên chức quản lý).",
      quizOptions: [
        "Khiển trách, Cảnh cáo, Hạ bậc lương, Buộc thôi việc",
        "Khiển trách, Cảnh cáo, Buộc thôi việc",
        "Khiển trách, Cảnh cáo, Cách chức, Buộc thôi việc",
        "Khiển trách, Giáng chức, Cách chức, Buộc thôi việc"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ Điều 52 Luật Viên chức 2010: Viên chức không giữ chức vụ quản lý chỉ chịu 3 hình thức: Khiển trách, Cảnh cáo, Buộc thôi việc. 'Hạ bậc lương' chỉ áp dụng cho công chức, 'Cách chức' chỉ cho viên chức quản lý.",
      sortItems: null,
      tags: ["kỷ luật", "hình thức"]
    },
    {
      id: "q_luatvc_007",
      topicId: "luat_vc",
      difficulty: 2,
      concept: "Theo Luật Viên chức sửa đổi 2019, thời hạn xử lý kỷ luật đối với viên chức tối đa là bao nhiêu ngày?",
      definition: "Không quá 90 ngày; trường hợp vụ việc có tình tiết phức tạp cần có thời gian thanh tra, kiểm tra thì thời hạn xử lý kỷ luật có thể kéo dài nhưng không quá 150 ngày.",
      quizOptions: [
        "Không quá 60 ngày; trường hợp phức tạp không quá 90 ngày",
        "Không quá 90 ngày; trường hợp phức tạp không quá 150 ngày",
        "Không quá 120 ngày; trường hợp phức tạp không quá 180 ngày",
        "Không quá 30 ngày; trường hợp phức tạp không quá 60 ngày"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ khoản 7 Điều 2 Luật sửa đổi 2019 (sửa Điều 53 Luật Viên chức 2010): Thời hạn xử lý kỷ luật thông thường không quá 90 ngày, vụ việc phức tạp không quá 150 ngày.",
      sortItems: null,
      tags: ["kỷ luật", "thời hạn"]
    },
    {
      id: "q_luatvc_008",
      topicId: "luat_vc",
      difficulty: 3,
      concept: "Trường hợp nào sau đây KHÔNG tính vào thời hạn xử lý kỷ luật đối với viên chức?",
      definition: "Thời gian nghỉ phép hàng năm; nghỉ việc riêng hợp pháp; thời gian điều trị nội trú bệnh hiểm nghèo; thời gian mang thai, nghỉ thai sản, nuôi con dưới 12 tháng tuổi đối với viên chức nữ (hoặc nam nuôi con dưới 12 tháng).",
      quizOptions: [
        "Thời gian đi học tập nâng cao trình độ chuyên môn ngắn hạn",
        "Thời gian mang thai, nghỉ thai sản, nuôi con dưới 12 tháng tuổi",
        "Thời gian đi công tác biệt phái tại đơn vị sự nghiệp khác",
        "Thời gian chờ quyết định bổ nhiệm vị trí mới"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ khoản 4 Điều 53 Luật Viên chức sửa đổi 2019: Thời gian mang thai, nghỉ chế độ thai sản, nuôi con dưới 12 tháng tuổi không tính vào thời hạn xử lý kỷ luật.",
      sortItems: null,
      tags: ["kỷ luật", "chuyên sâu"]
    },
    {
      id: "q_luatvc_009",
      topicId: "luat_vc",
      difficulty: 3,
      concept: "Đơn vị sự nghiệp công lập được đơn phương chấm dứt hợp đồng làm việc với viên chức khi có mấy năm liên tiếp bị đánh giá không hoàn thành nhiệm vụ?",
      definition: "Có 02 năm liên tiếp bị xếp loại chất lượng ở mức không hoàn thành nhiệm vụ.",
      quizOptions: [
        "01 năm bị xếp loại không hoàn thành nhiệm vụ",
        "02 năm liên tiếp bị xếp loại không hoàn thành nhiệm vụ",
        "03 năm liên tiếp bị xếp loại không hoàn thành nhiệm vụ",
        "02 năm không liên tiếp bị xếp loại không hoàn thành nhiệm vụ"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ điểm a khoản 1 Điều 29 Luật Viên chức 2010: Đơn vị được đơn phương chấm dứt hợp đồng khi viên chức có 02 năm liên tiếp bị xếp loại chất lượng ở mức không hoàn thành nhiệm vụ.",
      sortItems: null,
      tags: ["hợp đồng", "đánh giá"]
    },
    {
      id: "q_luatvc_010",
      topicId: "luat_vc",
      difficulty: 2,
      concept: "Hãy sắp xếp các bước trong quy trình tuyển dụng viên chức theo Nghị định 115/2020/NĐ-CP theo đúng trình tự:",
      definition: "Trình tự 5 bước tuyển dụng viên chức: 1. Thông báo tuyển dụng và tiếp nhận Phiếu đăng ký -> 2. Tổ chức thi tuyển hoặc xét tuyển Vòng 1 -> 3. Tổ chức thi môn nghiệp vụ chuyên ngành Vòng 2 -> 4. Thông báo kết quả trúng tuyển và hoàn thiện hồ sơ -> 5. Ký kết hợp đồng làm việc và nhận việc.",
      quizOptions: [
        "Thông báo tuyển dụng -> Thi Vòng 1 -> Thi Vòng 2 -> Thông báo trúng tuyển -> Ký hợp đồng làm việc",
        "Thi Vòng 1 -> Thông báo tuyển dụng -> Thi Vòng 2 -> Ký hợp đồng làm việc -> Thông báo trúng tuyển",
        "Thông báo tuyển dụng -> Thi Vòng 2 -> Thi Vòng 1 -> Thông báo trúng tuyển -> Ký hợp đồng làm việc",
        "Thông báo tuyển dụng -> Thi Vòng 1 -> Ký hợp đồng làm việc -> Thi Vòng 2 -> Thông báo trúng tuyển"
      ],
      quizAnswer: 0,
      explanation: "Căn cứ Nghị định 115/2020/NĐ-CP về tuyển dụng viên chức: Bắt đầu từ công khai thông báo, thi tuyển 2 vòng, thông báo kết quả, sau đó người trúng tuyển ký hợp đồng làm việc.",
      sortItems: [
        "Thông báo công khai tuyển dụng và tiếp nhận Phiếu đăng ký dự tuyển",
        "Tổ chức thi tuyển hoặc xét tuyển Vòng 1 (Kiến thức chung, Ngoại ngữ, Tin học)",
        "Tổ chức thi Vòng 2 (Môn nghiệp vụ chuyên ngành)",
        "Thông báo kết quả trúng tuyển và hoàn thiện hồ sơ tuyển dụng",
        "Người đứng đầu đơn vị ký kết hợp đồng làm việc và tiếp nhận viên chức"
      ],
      tags: ["sắp xếp", "tuyển dụng", "quy trình"]
    },
    {
      id: "q_luatvc_011",
      topicId: "luat_vc",
      difficulty: 3,
      concept: "Hãy sắp xếp đúng trình tự các bước xử lý kỷ luật đối với viên chức theo Nghị định 112/2020/NĐ-CP:",
      definition: "Trình tự xử lý kỷ luật viên chức gồm 4 bước: 1. Tổ chức cuộc họp kiểm điểm viên chức vi phạm -> 2. Thành lập Hội đồng kỷ luật -> 3. Tổ chức cuộc họp Hội đồng kỷ luật -> 4. Cấp có thẩm quyền ban hành quyết định kỷ luật.",
      quizOptions: [
        "Tổ chức họp kiểm điểm -> Thành lập Hội đồng kỷ luật -> Họp Hội đồng kỷ luật -> Ban hành quyết định kỷ luật",
        "Thành lập Hội đồng kỷ luật -> Tổ chức họp kiểm điểm -> Họp Hội đồng kỷ luật -> Ban hành quyết định kỷ luật",
        "Họp Hội đồng kỷ luật -> Tổ chức họp kiểm điểm -> Thành lập Hội đồng kỷ luật -> Ban hành quyết định kỷ luật",
        "Tổ chức họp kiểm điểm -> Ban hành quyết định kỷ luật -> Thành lập Hội đồng kỷ luật -> Họp Hội đồng kỷ luật"
      ],
      quizAnswer: 0,
      explanation: "Căn cứ Điều 32 Nghị định 112/2020/NĐ-CP: Quy trình xử lý kỷ luật viên chức bắt buộc thực hiện theo trình tự: Họp kiểm điểm -> Thành lập Hội đồng kỷ luật -> Họp Hội đồng kỷ luật -> Ra quyết định kỷ luật.",
      sortItems: [
        "Tổ chức cuộc họp kiểm điểm người có hành vi vi phạm",
        "Thành lập Hội đồng kỷ luật của đơn vị sự nghiệp",
        "Tổ chức cuộc họp Hội đồng kỷ luật để xem xét, bỏ phiếu kiến nghị",
        "Cấp có thẩm quyền xem xét và ban hành quyết định xử lý kỷ luật"
      ],
      tags: ["sắp xếp", "kỷ luật", "quy trình"]
    },
    {
      id: "q_luatvc_012",
      topicId: "luat_vc",
      difficulty: 2,
      concept: "Đặc điểm pháp lý nào sau đây là của Đơn vị sự nghiệp công lập theo Luật Viên chức 2010?",
      definition: "Do cơ quan có thẩm quyền của Nhà nước, tổ chức chính trị, tổ chức chính trị - xã hội thành lập theo quy định của pháp luật, có tư cách pháp nhân, cung cấp dịch vụ công, phục vụ quản lý nhà nước.",
      quizOptions: [
        "Là doanh nghiệp do Nhà nước nắm giữ 100% vốn điều lệ để kinh doanh sinh lời",
        "Là cơ quan thực thi quyền lực hành chính nhà nước có thẩm quyền chung",
        "Có tư cách pháp nhân, cung cấp dịch vụ công, phục vụ quản lý nhà nước",
        "Là tổ chức hội nghề nghiệp tự trang trải hoàn toàn kinh phí hoạt động"
      ],
      quizAnswer: 2,
      explanation: "Căn cứ khoản 1 Điều 9 Luật Viên chức 2010: Đơn vị sự nghiệp công lập có tư cách pháp nhân, cung cấp dịch vụ công và phục vụ quản lý nhà nước.",
      sortItems: null,
      tags: ["đơn vị sự nghiệp", "cơ cấu"]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CHỦ ĐỀ 2: LUẬT CÁN BỘ, CÔNG CHỨC (topicId: "luat_cbcc") — 12 câu hỏi
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "q_cbcc_001",
      topicId: "luat_cbcc",
      difficulty: 1,
      concept: "Điểm khác biệt căn bản về phương thức hình thành chức vụ giữa Cán bộ và Công chức là gì?",
      definition: "Cán bộ được bầu cử, phê chuẩn, bổ nhiệm giữ chức vụ, chức danh theo nhiệm kỳ; còn Công chức được tuyển dụng, bổ nhiệm vào ngạch, chức vụ, chức danh trong biên chế.",
      quizOptions: [
        "Cán bộ ký hợp đồng làm việc, công chức được bổ nhiệm theo quyết định",
        "Cán bộ được bầu cử, phê chuẩn theo nhiệm kỳ; công chức được tuyển dụng, bổ nhiệm vào ngạch trong biên chế",
        "Cán bộ làm việc tại đơn vị sự nghiệp, công chức làm việc tại cơ quan nhà nước",
        "Cán bộ hưởng lương từ quỹ sự nghiệp, công chức hưởng lương từ ngân sách nhà nước"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ khoản 1 và khoản 2 Điều 4 Luật Cán bộ, công chức 2008: Cán bộ do bầu cử/phê chuẩn theo nhiệm kỳ; Công chức do tuyển dụng/bổ nhiệm vào ngạch trong biên chế.",
      sortItems: null,
      tags: ["khái niệm", "phân biệt"]
    },
    {
      id: "q_cbcc_002",
      topicId: "luat_cbcc",
      difficulty: 1,
      concept: "Theo Luật Cán bộ, công chức 2008, có bao nhiêu nguyên tắc trong thi hành công vụ?",
      definition: "Có 05 nguyên tắc: 1. Tuân thủ Hiến pháp và pháp luật; 2. Bảo vệ lợi ích của Nhà nước, quyền và lợi ích hợp pháp của tổ chức, công dân; 3. Công khai, minh bạch, đúng thẩm quyền và có sự kiểm tra, giám sát; 4. Bảo đảm tính hệ thống, thống nhất, liên tục, thông suốt và hiệu quả; 5. Bảo đảm thứ bậc hành chính và sự phục tùng chặt chẽ.",
      quizOptions: [
        "04 nguyên tắc",
        "05 nguyên tắc",
        "06 nguyên tắc",
        "07 nguyên tắc"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ Điều 3 Luật Cán bộ, công chức 2008 quy định rõ 05 nguyên tắc trong thi hành công vụ.",
      sortItems: null,
      tags: ["nguyên tắc", "công vụ"]
    },
    {
      id: "q_cbcc_003",
      topicId: "luat_cbcc",
      difficulty: 1,
      concept: "Ngạch công chức theo Luật Cán bộ, công chức (sửa đổi 2019) bao gồm những ngạch nào?",
      definition: "Bao gồm: Chuyên viên cao cấp và tương đương; Chuyên viên chính và tương đương; Chuyên viên và tương đương; Cán sự và tương đương; Nhân viên; và ngạch khác theo quy định của Chính phủ.",
      quizOptions: [
        "Chuyên viên cao cấp, Chuyên viên chính, Chuyên viên, Cán sự, Nhân viên",
        "Chuyên viên trưởng, Chuyên viên chính, Chuyên viên, Cán sự",
        "Chuyên viên cao cấp, Chuyên gia cao cấp, Chuyên viên, Nhân viên",
        "Thanh tra viên cao cấp, Chuyên viên chính, Kỹ thuật viên, Nhân viên"
      ],
      quizAnswer: 0,
      explanation: "Căn cứ khoản 4 Điều 1 Luật sửa đổi 2019 (sửa Điều 34 Luật CBCC 2008): Ngạch công chức gồm 5 ngạch từ Nhân viên đến Chuyên viên cao cấp và tương đương.",
      sortItems: null,
      tags: ["ngạch", "phân loại"]
    },
    {
      id: "q_cbcc_004",
      topicId: "luat_cbcc",
      difficulty: 2,
      concept: "Hình thức kỷ luật nào sau đây KHÔNG áp dụng đối với công chức không giữ chức vụ lãnh đạo, quản lý?",
      definition: "Hình thức 'Cách chức' và 'Giáng chức' chỉ áp dụng đối với công chức giữ chức vụ lãnh đạo, quản lý.",
      quizOptions: [
        "Hạ bậc lương",
        "Cách chức",
        "Cảnh cáo",
        "Khiển trách"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ khoản 1 Điều 79 Luật CBCC sửa đổi 2019: Công chức không giữ chức vụ lãnh đạo chỉ chịu 4 hình thức: Khiển trách, Cảnh cáo, Hạ bậc lương, Buộc thôi việc. Cách chức và Giáng chức chỉ dành cho lãnh đạo.",
      sortItems: null,
      tags: ["kỷ luật", "hình thức"]
    },
    {
      id: "q_cbcc_005",
      topicId: "luat_cbcc",
      difficulty: 2,
      concept: "Nghĩa vụ hàng đầu của cán bộ, công chức đối với Đảng, Nhà nước và Nhân dân quy định tại Điều 8 là gì?",
      definition: "Trung thành với Đảng Cộng sản Việt Nam, Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam; bảo vệ danh dự Tổ quốc và lợi ích quốc gia.",
      quizOptions: [
        "Tôn trọng nhân dân, tận tụy phục vụ nhân dân",
        "Trung thành với Đảng Cộng sản Việt Nam, Nhà nước CHXHCN Việt Nam; bảo vệ danh dự Tổ quốc",
        "Chấp hành nghiêm chỉnh đường lối, chủ trương của cấp ủy cơ quan",
        "Liên hệ chặt chẽ với nhân dân, lắng nghe ý kiến của nhân dân"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ khoản 1 Điều 8 Luật Cán bộ, công chức 2008: Nghĩa vụ trung thành với Đảng và Nhà nước, bảo vệ lợi ích quốc gia là nghĩa vụ chính trị thiêng liêng số 1.",
      sortItems: null,
      tags: ["nghĩa vụ", "đạo đức"]
    },
    {
      id: "q_cbcc_006",
      topicId: "luat_cbcc",
      difficulty: 2,
      concept: "Trường hợp nào sau đây KHÔNG được đăng ký dự tuyển công chức theo Luật Cán bộ, công chức 2008?",
      definition: "Người không cư trú tại Việt Nam; người mất hoặc bị hạn chế năng lực hành vi dân sự; người đang bị truy cứu trách nhiệm hình sự hoặc đang chấp hành bản án hình sự.",
      quizOptions: [
        "Người từ đủ 18 tuổi trở lên, có quốc tịch Việt Nam",
        "Người có văn bằng, chứng chỉ phù hợp với vị trí việc làm",
        "Người đang bị truy cứu trách nhiệm hình sự hoặc đang chấp hành bản án hình sự",
        "Người có phẩm chất chính trị, đạo đức tốt và có đơn dự tuyển"
      ],
      quizAnswer: 2,
      explanation: "Căn cứ khoản 2 Điều 36 Luật Cán bộ, công chức 2008: Người đang bị truy cứu trách nhiệm hình sự, chấp hành bản án thì không được đăng ký dự tuyển.",
      sortItems: null,
      tags: ["tuyển dụng", "điều kiện"]
    },
    {
      id: "q_cbcc_007",
      topicId: "luat_cbcc",
      difficulty: 2,
      concept: "Theo Luật Cán bộ, công chức sửa đổi 2019, thời hiệu xử lý kỷ luật bằng hình thức khiển trách là bao lâu?",
      definition: "Là 02 năm (24 tháng) kể từ thời điểm có hành vi vi phạm.",
      quizOptions: [
        "12 tháng (01 năm)",
        "24 tháng (02 năm)",
        "36 tháng (03 năm)",
        "60 tháng (05 năm)"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ khoản 1 Điều 80 Luật CBCC sửa đổi 2019: Thời hiệu xử lý kỷ luật là 02 năm đối với vi phạm ít nghiêm trọng đến mức khiển trách; 05 năm đối với các hành vi còn lại.",
      sortItems: null,
      tags: ["kỷ luật", "thời hiệu"]
    },
    {
      id: "q_cbcc_008",
      topicId: "luat_cbcc",
      difficulty: 3,
      concept: "Hành vi vi phạm nào sau đây của cán bộ, công chức KHÔNG áp dụng thời hiệu xử lý kỷ luật (có thể xử lý bất kỳ lúc nào)?",
      definition: "1. Cán bộ, công chức là đảng viên bị kỷ luật bằng hình thức khai trừ; 2. Vi phạm bảo vệ chính trị nội bộ; 3. Xâm hại lợi ích quốc gia về an ninh, quốc phòng, đối ngoại; 4. Sử dụng văn bằng, chứng chỉ, giấy chứng nhận giả hợp pháp.",
      quizOptions: [
        "Hành vi sử dụng văn bằng, chứng chỉ, chứng nhận giả, không hợp pháp",
        "Vi phạm kỷ luật lao động, vắng mặt 03 ngày liên tục không lý do",
        "Gây mất đoàn kết nội bộ cơ quan trong các cuộc họp",
        "Chậm trễ trong việc giải quyết thủ tục hành chính cho người dân"
      ],
      quizAnswer: 0,
      explanation: "Căn cứ khoản 2 Điều 80 Luật CBCC sửa đổi 2019: Các hành vi sử dụng bằng cấp giả, khai trừ đảng, xâm hại an ninh quốc gia là những trường hợp không áp dụng thời hiệu xử lý kỷ luật.",
      sortItems: null,
      tags: ["kỷ luật", "chuyên sâu"]
    },
    {
      id: "q_cbcc_009",
      topicId: "luat_cbcc",
      difficulty: 3,
      concept: "Công chức có mấy năm liên tiếp bị xếp loại chất lượng ở mức không hoàn thành nhiệm vụ thì cơ quan có thẩm quyền cho thôi việc?",
      definition: "Có 02 năm liên tiếp không hoàn thành nhiệm vụ.",
      quizOptions: [
        "01 năm không hoàn thành nhiệm vụ",
        "02 năm liên tiếp không hoàn thành nhiệm vụ",
        "03 năm liên tiếp không hoàn thành nhiệm vụ",
        "02 năm không liên tiếp trong một nhiệm kỳ"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ khoản 3 Điều 58 Luật Cán bộ, công chức (sửa đổi 2019): Công chức có 02 năm liên tiếp bị đánh giá không hoàn thành nhiệm vụ thì cơ quan cho thôi việc.",
      sortItems: null,
      tags: ["đánh giá", "thôi việc"]
    },
    {
      id: "q_cbcc_010",
      topicId: "luat_cbcc",
      difficulty: 2,
      concept: "Hãy sắp xếp các ngạch công chức theo thứ bậc từ bậc thấp nhất đến bậc cao nhất theo Điều 34 Luật Cán bộ, công chức:",
      definition: "Thứ bậc ngạch công chức từ thấp lên cao: 1. Ngạch Nhân viên -> 2. Ngạch Cán sự và tương đương -> 3. Ngạch Chuyên viên và tương đương -> 4. Ngạch Chuyên viên chính và tương đương -> 5. Ngạch Chuyên viên cao cấp và tương đương.",
      quizOptions: [
        "Nhân viên -> Cán sự -> Chuyên viên -> Chuyên viên chính -> Chuyên viên cao cấp",
        "Cán sự -> Nhân viên -> Chuyên viên -> Chuyên viên chính -> Chuyên viên cao cấp",
        "Nhân viên -> Chuyên viên -> Cán sự -> Chuyên viên chính -> Chuyên viên cao cấp",
        "Nhân viên -> Cán sự -> Chuyên viên chính -> Chuyên viên -> Chuyên viên cao cấp"
      ],
      quizAnswer: 0,
      explanation: "Căn cứ Điều 34 Luật Cán bộ, công chức: Bậc ngạch bắt đầu từ Nhân viên, lên Cán sự, Chuyên viên, Chuyên viên chính và cao nhất là Chuyên viên cao cấp.",
      sortItems: [
        "Ngạch Nhân viên",
        "Ngạch Cán sự và tương đương",
        "Ngạch Chuyên viên và tương đương",
        "Ngạch Chuyên viên chính và tương đương",
        "Ngạch Chuyên viên cao cấp và tương đương"
      ],
      tags: ["sắp xếp", "ngạch", "thứ bậc"]
    },
    {
      id: "q_cbcc_011",
      topicId: "luat_cbcc",
      difficulty: 3,
      concept: "Hãy sắp xếp đúng trình tự các giai đoạn thi tuyển công chức theo Nghị định 138/2020/NĐ-CP:",
      definition: "Quy trình thi tuyển công chức gồm 4 giai đoạn: 1. Thi trắc nghiệm Vòng 1 phần Kiến thức chung -> 2. Thi trắc nghiệm Vòng 1 phần Ngoại ngữ và Tin học -> 3. Thông báo kết quả Vòng 1 và triệu tập thí sinh vào Vòng 2 -> 4. Tổ chức thi môn Nghiệp vụ chuyên ngành Vòng 2.",
      quizOptions: [
        "Thi Kiến thức chung Vòng 1 -> Thi Ngoại ngữ, Tin học Vòng 1 -> Công bố kết quả & triệu tập Vòng 2 -> Thi Nghiệp vụ chuyên ngành Vòng 2",
        "Thi Nghiệp vụ chuyên ngành Vòng 2 -> Thi Kiến thức chung Vòng 1 -> Thi Ngoại ngữ, Tin học Vòng 1 -> Công bố kết quả",
        "Thi Ngoại ngữ, Tin học Vòng 1 -> Thi Nghiệp vụ chuyên ngành Vòng 2 -> Thi Kiến thức chung Vòng 1 -> Triệu tập thí sinh",
        "Thi Kiến thức chung Vòng 1 -> Thi Nghiệp vụ chuyên ngành Vòng 2 -> Thi Ngoại ngữ, Tin học Vòng 1 -> Triệu tập thí sinh"
      ],
      quizAnswer: 0,
      explanation: "Căn cứ Nghị định 138/2020/NĐ-CP: Vòng 1 trắc nghiệm Kiến thức chung, Ngoại ngữ, Tin học. Đạt điểm chuẩn Vòng 1 mới được triệu tập thi Vòng 2 Nghiệp vụ chuyên ngành.",
      sortItems: [
        "Thi trắc nghiệm Vòng 1: Phần Kiến thức chung (60 phút)",
        "Thi trắc nghiệm Vòng 1: Phần Ngoại ngữ (30 phút) và Tin học (30 phút nếu có)",
        "Hội đồng tuyển dụng thông báo kết quả Vòng 1 và lập danh sách triệu tập vào Vòng 2",
        "Thi Vòng 2: Môn Nghiệp vụ chuyên ngành (Phỏng vấn hoặc Viết hoặc Kết hợp)"
      ],
      tags: ["sắp xếp", "thi tuyển", "công chức"]
    },
    {
      id: "q_cbcc_012",
      topicId: "luat_cbcc",
      difficulty: 2,
      concept: "Theo Điều 16 Luật Cán bộ, công chức, trong giao tiếp ở công sở, cán bộ, công chức phải thực hiện yêu cầu nào?",
      definition: "Có thái độ lịch sự, tôn trọng đồng nghiệp; ngôn ngữ giao tiếp phải chuẩn mực, rõ ràng, mạch lạc; phải lắng nghe ý kiến của đồng nghiệp; khi thi hành công vụ phải mang phù hiệu hoặc thẻ công chức; có tác phong lịch sự; giữ gìn uy tín cho cơ quan.",
      quizOptions: [
        "Luôn chấp hành tuyệt đối mọi yêu cầu của đồng nghiệp cấp trên mà không được thắc mắc",
        "Có thái độ lịch sự, tôn trọng đồng nghiệp; ngôn ngữ chuẩn mực; mang phù hiệu hoặc thẻ công chức",
        "Được quyền từ chối tiếp công dân nếu đang xử lý công việc nội bộ văn phòng",
        "Chỉ cần đeo thẻ công chức trong các cuộc họp giao ban quan trọng"
      ],
      quizAnswer: 1,
      explanation: "Căn cứ Điều 16 Luật Cán bộ, công chức 2008: Cán bộ, công chức trong giao tiếp ở công sở phải lịch sự, chuẩn mực, lắng nghe và phải mang phù hiệu/thẻ công chức.",
      sortItems: null,
      tags: ["văn hóa", "công sở", "đạo đức"]
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // DANH MỤC CỬA HÀNG (20 VẬT PHẨM TRÊN 6 DANH MỤC)
  // ═══════════════════════════════════════════════════════════════════════
  shopItems: [
    // ── Category 1: furniture (4 items) ──
    {
      id: "desk_pink",
      name: "Bàn Học Gỗ",
      category: "furniture",
      price: 25,
      icon: "🪑",
      emoji: "🪑",
      cssClass: "item-desk-pink",
      image: "assets/isometric/furniture/desk_study.svg",
      width: 120,
      height: 110,
      description: "Bàn học gỗ phong cách pastel có sách và đèn bàn tiếp thêm cảm hứng ôn thi."
    },
    {
      id: "shelf_wood",
      name: "Sofa Vàng Cozy",
      category: "furniture",
      price: 30,
      icon: "🛋️",
      emoji: "🛋️",
      cssClass: "item-shelf",
      image: "assets/isometric/furniture/sofa_yellow.svg",
      anchor: "seat",
      width: 140,
      height: 110,
      description: "Chiếc sofa vàng êm ái có gối ôm socola cho bé cưng ngồi chill."
    },
    {
      id: "chair_cute",
      name: "Ghế Đệm Bông",
      category: "furniture",
      price: 20,
      icon: "💺",
      emoji: "💺",
      cssClass: "item-chair",
      image: "assets/isometric/furniture/chair_study.svg",
      anchor: "seat",
      width: 80,
      height: 95,
      description: "Chiếc ghế gỗ đệm bông êm ái, bé pet có thể ngồi lên để chăm chỉ học bài."
    },
    {
      id: "bed_cozy",
      name: "Giường Ngủ Hồng",
      category: "furniture",
      price: 45,
      icon: "🛏️",
      emoji: "🛏️",
      cssClass: "item-bed",
      image: "assets/isometric/furniture/bed_single_pink.svg",
      anchor: "bed",
      width: 150,
      height: 125,
      description: "Giường ngủ nhỏ ấm áp có chăn hồng chấm bi cho bé thú cưng say giấc nồng."
    },

    // ── Category 2: lighting (3 items) ──
    {
      id: "lamp_table",
      name: "Máy Lọc Khí & Đèn",
      category: "lighting",
      price: 15,
      icon: "💡",
      emoji: "💡",
      cssClass: "item-lamp-table",
      image: "assets/isometric/furniture/air_purifier.svg",
      width: 70,
      height: 110,
      description: "Tháp lọc không khí thông minh hiển thị nhiệt độ, giữ phòng luôn thoáng đãng."
    },
    {
      id: "lamp_fairy",
      name: "Dây Đèn Fairy",
      category: "lighting",
      price: 20,
      icon: "✨",
      emoji: "✨",
      cssClass: "item-lamp-fairy",
      description: "Dây đèn đom đóm lấp lánh mang lại không gian mộng mơ, thư giãn."
    },
    {
      id: "lamp_ceil",
      name: "Đèn Trần Tròn",
      category: "lighting",
      price: 25,
      icon: "🏮",
      emoji: "🏮",
      cssClass: "item-lamp-ceil",
      description: "Đèn trần hình tròn phong cách tối giản chuẩn Hàn Quốc."
    },

    // ── Category 3: plant (4 items) ──
    {
      id: "cactus_pot",
      name: "Chậu Cây Chân Gỗ",
      category: "plant",
      price: 10,
      icon: "🪴",
      emoji: "🪴",
      cssClass: "item-cactus",
      image: "assets/isometric/furniture/plant_monstera.svg",
      width: 90,
      height: 120,
      description: "Chậu cây Monstera lá xanh tươi trên chân đôn gỗ sồi sang trọng."
    },
    {
      id: "tulip_vase",
      name: "Bàn Trà Hoa Tulip",
      category: "plant",
      price: 15,
      icon: "🌷",
      emoji: "🌷",
      cssClass: "item-tulip",
      image: "assets/isometric/furniture/tea_table.svg",
      width: 120,
      height: 100,
      description: "Bàn trà gỗ tam giác bo tròn cắm bình hoa tulip đỏ tươi tắn."
    },
    {
      id: "succulent_box",
      name: "Sen Đá May Mắn",
      category: "plant",
      price: 12,
      icon: "🪴",
      emoji: "🪴",
      cssClass: "item-succulent",
      description: "Chậu sen đá phong thủy cầu may mắn đỗ đạt thủ khoa kỳ thi."
    },
    {
      id: "ivy_wall",
      name: "Cầu Trượt Sân Vườn",
      category: "plant",
      price: 18,
      icon: "🎢",
      emoji: "🎢",
      cssClass: "item-ivy",
      image: "assets/isometric/furniture/garden_slide.svg",
      anchor: "play",
      width: 130,
      height: 140,
      description: "Cầu trượt pastel mát mẻ đặt ngoài sân vườn cho các bé vui chơi thỏa thích."
    },

    // ── Category 4: wall (4 items) ──
    {
      id: "frame_photo",
      name: "Khung Ảnh Kỷ Niệm",
      category: "wall",
      price: 15,
      icon: "🖼️",
      emoji: "🖼️",
      cssClass: "item-frame",
      description: "Khung ảnh nhỏ lưu giữ khoảnh khắc đáng nhớ cùng người thương."
    },
    {
      id: "clock_cat",
      name: "Đồng Hồ Mèo",
      category: "wall",
      price: 20,
      icon: "⏰",
      emoji: "⏰",
      cssClass: "item-clock",
      description: "Đồng hồ treo tường hình tai mèo nhắc nhở đúng giờ vào bàn học."
    },
    {
      id: "poster_cheer",
      name: "Poster Cố Lên",
      category: "wall",
      price: 12,
      icon: "📜",
      emoji: "📜",
      cssClass: "item-poster",
      description: "Poster chữ thư pháp dễ thương: 'Quyết tâm đỗ viên chức ngay lần đầu!'"
    },
    {
      id: "calendar_desk",
      name: "Lịch Đếm Ngược",
      category: "wall",
      price: 15,
      icon: "📅",
      emoji: "📅",
      cssClass: "item-calendar",
      description: "Lịch đếm ngược từng ngày đến kỳ thi tuyển dụng công chức."
    },

    // ── Category 5: wallpaper (3 items) ──
    {
      id: "wp_pink",
      name: "Tường Hồng Pastel",
      category: "wallpaper",
      price: 30,
      icon: "🎨",
      emoji: "🎨",
      cssClass: "wp-pink",
      description: "Tone hồng pastel ngọt ngào ấm cúng, chuẩn phong cách công chúa."
    },
    {
      id: "wp_blue",
      name: "Tường Xanh Mint",
      category: "wallpaper",
      price: 30,
      icon: "🎨",
      emoji: "🎨",
      cssClass: "wp-blue",
      description: "Tone xanh mint dịu nhẹ, tạo cảm giác thư thái không căng thẳng."
    },
    {
      id: "wp_cream",
      name: "Tường Kem Vintage",
      category: "wallpaper",
      price: 30,
      icon: "🎨",
      emoji: "🎨",
      cssClass: "wp-cream",
      description: "Tone màu kem sữa ấm áp mang lại không gian học tập tĩnh tại."
    },

    // ── Category 6: floor (2 items) ──
    {
      id: "floor_wood",
      name: "Sàn Gỗ Tự Nhiên",
      category: "floor",
      price: 35,
      icon: "🪵",
      emoji: "🪵",
      cssClass: "floor-wood",
      description: "Sàn gỗ sồi sáng màu chuẩn phong cách Bắc Âu thanh lịch."
    },
    {
      id: "floor_tile",
      name: "Gạch Men Ca Rô",
      category: "floor",
      price: 35,
      icon: "🏁",
      emoji: "🏁",
      cssClass: "floor-tile",
      description: "Sàn gạch caro hồng trắng cổ điển cực kỳ đáng yêu."
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // DANH MỤC THÚ CƯNG (5 LOÀI)
  // ═══════════════════════════════════════════════════════════════════════
  petCatalog: [
    {
      type: "cat",
      name: "Mèo Con",
      price: 0,
      icon: "🐱",
      emoji: "🐱",
      cssClass: "pet-cat",
      image: "assets/isometric/pets/cat_idle.svg",
      poses: {
        idle: "assets/isometric/pets/cat_idle.svg",
        sit: "assets/isometric/pets/cat_sit.svg",
        sleep: "assets/isometric/pets/cat_sleep.svg",
        walk: "assets/isometric/pets/cat_idle.svg"
      },
      personality: "Tinh nghịch, thích đọc sách",
      description: "Bé mèo tam thể thông minh, luôn ngồi bên cạnh bạn mỗi khi ôn bài thi."
    },
    {
      type: "bunny",
      name: "Thỏ Bông",
      price: 80,
      icon: "🐰",
      emoji: "🐰",
      cssClass: "pet-bunny",
      image: "assets/isometric/pets/bunny_idle.svg",
      poses: {
        idle: "assets/isometric/pets/bunny_idle.svg",
        sit: "assets/isometric/pets/cat_sit.svg",
        sleep: "assets/isometric/pets/cat_sleep.svg",
        walk: "assets/isometric/pets/bunny_idle.svg"
      },
      personality: "Nhút nhát, thích mặc yếm hồng",
      description: "Bé thỏ trắng mặc quần yếm hồng siêu ngọt ngào, cùng bạn chăm chỉ giải đề."
    },
    {
      type: "hamster",
      name: "Hamster",
      price: 120,
      icon: "🐹",
      emoji: "🐹",
      cssClass: "pet-hamster",
      image: "assets/isometric/pets/hamster_idle.svg",
      poses: {
        idle: "assets/isometric/pets/hamster_idle.svg",
        sit: "assets/isometric/pets/hamster_sit.svg",
        sleep: "assets/isometric/pets/hamster_sleep.svg",
        walk: "assets/isometric/pets/hamster_idle.svg"
      },
      personality: "Đội mũ cói, thích ăn phô mai",
      description: "Bé chuột hamster má phúng phính đội mũ cói, biểu tượng kiên trì đỗ viên chức!"
    },
    {
      type: "bear",
      name: "Gấu Bông",
      price: 100,
      icon: "🐻",
      emoji: "🐻",
      cssClass: "pet-bear",
      image: "assets/isometric/pets/cat_idle.svg",
      poses: {
        idle: "assets/isometric/pets/cat_idle.svg",
        sit: "assets/isometric/pets/cat_sit.svg",
        sleep: "assets/isometric/pets/cat_sleep.svg",
        walk: "assets/isometric/pets/cat_idle.svg"
      },
      personality: "Hiền lành, hay ngủ nướng",
      description: "Chú gấu nâu tròn trĩnh ấm áp, luôn kiên nhẫn cổ vũ bạn vượt qua câu khó."
    },
    {
      type: "duck",
      name: "Vịt Con",
      price: 80,
      icon: "🦆",
      emoji: "🦆",
      cssClass: "pet-duck",
      image: "assets/isometric/pets/bunny_idle.svg",
      poses: {
        idle: "assets/isometric/pets/bunny_idle.svg",
        sit: "assets/isometric/pets/hamster_sit.svg",
        sleep: "assets/isometric/pets/hamster_sleep.svg",
        walk: "assets/isometric/pets/bunny_idle.svg"
      },
      personality: "Vui vẻ, hay lắc lư",
      description: "Chú vịt vàng lí lắc, biết nhảy múa ăn mừng mỗi khi bạn làm đúng 100% quiz."
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // DANH MỤC 10 HUY HIỆU
  // ═══════════════════════════════════════════════════════════════════════
  badges: [
    {
      id: "first_lesson",
      name: "Người Mới",
      icon: "🌟",
      emoji: "🌟",
      description: "Hoàn thành bài học đầu tiên",
      condition: "Hoàn thành bài học đầu tiên"
    },
    {
      id: "streak_7",
      name: "Kiên Trì",
      icon: "🔥",
      emoji: "🔥",
      description: "Chuỗi học liên tục 7 ngày",
      condition: "Chuỗi học liên tục 7 ngày"
    },
    {
      id: "perfect_quiz",
      name: "Hoàn Hảo",
      icon: "💯",
      emoji: "💯",
      description: "Đạt 100% điểm trong một bộ quiz",
      condition: "Đạt 100% điểm trong một bộ quiz"
    },
    {
      id: "boss_hunter",
      name: "Thợ Săn Boss",
      icon: "👹",
      emoji: "👹",
      description: "Đánh bại Boss lần đầu tiên",
      condition: "Đánh bại Boss lần đầu tiên"
    },
    {
      id: "decorator_10",
      name: "Kiến Trúc Sư",
      icon: "🏠",
      emoji: "🏠",
      description: "Sở hữu 10 món đồ trang trí",
      condition: "Sở hữu 10 món đồ trang trí"
    },
    {
      id: "pet_lover_3",
      name: "Bạn Của Thú",
      icon: "🐾",
      emoji: "🐾",
      description: "Nhận nuôi 3 bé pet trở lên",
      condition: "Nhận nuôi 3 bé pet trở lên"
    },
    {
      id: "scholar_50",
      name: "Học Giả",
      icon: "📚",
      emoji: "📚",
      description: "Có 50 câu đạt mức Đã Thuộc (Mastered)",
      condition: "Có 50 câu đạt mức Đã Thuộc (Mastered)"
    },
    {
      id: "speed_demon",
      name: "Tia Chớp",
      icon: "⚡",
      emoji: "⚡",
      description: "Đạt 20+ câu đúng trong Thi Tốc Độ",
      condition: "Đạt 20+ câu đúng trong Thi Tốc Độ"
    },
    {
      id: "survivor_20",
      name: "Bất Bại",
      icon: "🛡️",
      emoji: "🛡️",
      description: "Đạt 20+ câu đúng trong Sống Sót",
      condition: "Đạt 20+ câu đúng trong Sống Sót"
    },
    {
      id: "combo_10",
      name: "Combo Master",
      icon: "🔥",
      emoji: "🔥",
      description: "Đạt chuỗi Combo 10 câu liên tiếp",
      condition: "Đạt chuỗi Combo 10 câu liên tiếp"
    }
  ]
};

// Dual-environment export
if (typeof window !== 'undefined') {
  window.DATA = DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DATA;
}
