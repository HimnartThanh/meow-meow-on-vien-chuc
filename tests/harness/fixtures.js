/**
 * tests/harness/fixtures.js
 * Authoritative test fixtures derived directly from GAME_STATE.md and ORIGINAL_REQUEST.md.
 */

const path = require('path');
const fs = require('fs');
const { createBrowserEnvironment, loadScriptIntoSandbox } = require('./mock_browser');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const AUTHORITATIVE_TOPICS = [
  {
    id: 'luat_vc',
    name: 'Luật Viên Chức',
    icon: '📜',
    description: 'Luật Viên chức 2010, sửa đổi bổ sung 2019'
  },
  {
    id: 'dao_duc',
    name: 'Đạo Đức Công Vụ',
    icon: '⚖️',
    description: 'Quy tắc ứng xử, văn hóa giao tiếp và đạo đức nghề nghiệp'
  }
];

const AUTHORITATIVE_QUESTIONS = [
  {
    id: 'q_luatvc_001',
    topicId: 'luat_vc',
    difficulty: 1,
    concept: 'Khái niệm Viên chức',
    definition: 'Công dân Việt Nam được tuyển dụng theo vị trí việc làm, làm việc tại ĐVSNCL theo chế độ HĐLV.',
    quizOptions: [
      'Công chức được bổ nhiệm ngạch',
      'Công dân Việt Nam được tuyển dụng theo vị trí việc làm, làm việc tại ĐVSNCL theo chế độ HĐLV',
      'Người lao động ký HĐLĐ thông thường',
      'Cán bộ bầu cử theo nhiệm kỳ'
    ],
    quizAnswer: 1,
    explanation: 'Khoản 1 Điều 2 Luật Viên chức 2010 quy định về khái niệm viên chức.',
    sortItems: null,
    tags: ['khái niệm', 'luật']
  },
  {
    id: 'q_luatvc_002',
    topicId: 'luat_vc',
    difficulty: 2,
    concept: 'Quy trình xử lý kỷ luật viên chức',
    definition: 'Tổ chức họp kiểm điểm -> Thành lập Hội đồng kỷ luật -> Họp Hội đồng -> Người đứng đầu ra quyết định.',
    quizOptions: [
      'Ra quyết định ngay',
      'Họp kiểm điểm -> Thành lập Hội đồng -> Họp Hội đồng -> Ra quyết định',
      'Báo cáo cấp trên rồi ra quyết định',
      'Kiểm điểm rồi đình chỉ'
    ],
    quizAnswer: 1,
    explanation: 'Nghị định 112/2020/NĐ-CP về xử lý kỷ luật cán bộ, công chức, viên chức.',
    sortItems: [
      '1. Tổ chức cuộc họp kiểm điểm',
      '2. Thành lập Hội đồng kỷ luật',
      '3. Tổ chức họp Hội đồng kỷ luật',
      '4. Người có thẩm quyền ra quyết định kỷ luật'
    ],
    tags: ['quy trình', 'kỷ luật']
  },
  {
    id: 'q_luatvc_003',
    topicId: 'luat_vc',
    difficulty: 2,
    concept: 'Quy trình tuyển dụng viên chức',
    definition: 'Thông báo tuyển dụng -> Tiếp nhận hồ sơ -> Tổ chức thi/xét -> Phê duyệt kết quả -> Ký hợp đồng làm việc.',
    quizOptions: [
      'Phỏng vấn trực tiếp',
      'Thông báo -> Tiếp nhận hồ sơ -> Tổ chức thi/xét -> Phê duyệt kết quả -> Ký hợp đồng làm việc',
      'Ký hợp đồng ngay',
      'Xét duyệt hồ sơ nội bộ'
    ],
    quizAnswer: 1,
    explanation: 'Nghị định 115/2020/NĐ-CP về tuyển dụng, sử dụng và quản lý viên chức.',
    sortItems: [
      '1. Thông báo tuyển dụng công khai',
      '2. Tiếp nhận phiếu đăng ký dự tuyển',
      '3. Tổ chức thi tuyển hoặc xét tuyển',
      '4. Phê duyệt kết quả tuyển dụng',
      '5. Hoàn thiện hồ sơ và ký hợp đồng làm việc'
    ],
    tags: ['quy trình', 'tuyển dụng']
  },
  {
    id: 'q_daoduc_001',
    topicId: 'dao_duc',
    difficulty: 1,
    concept: 'Quy tắc ứng xử với người dân',
    definition: 'Tôn trọng, lắng nghe, hòa nhã, giải thích rõ ràng quy định pháp luật.',
    quizOptions: [
      'Cửa quyền hách dịch',
      'Tôn trọng, lắng nghe, hòa nhã, giải thích rõ ràng quy định pháp luật',
      'Tránh né tiếp xúc',
      'Yêu cầu bồi dưỡng'
    ],
    quizAnswer: 1,
    explanation: 'Điều 17 Luật Viên chức về văn hóa giao tiếp với nhân dân.',
    sortItems: null,
    tags: ['đạo đức', 'giao tiếp']
  },
  {
    id: 'q_daoduc_002',
    topicId: 'dao_duc',
    difficulty: 3,
    concept: 'Trình tự tiếp công dân tại cơ quan',
    definition: 'Đón tiếp và xác định nhân thân -> Nghe trình bày -> Xem xét hồ sơ -> Hướng dẫn/giải quyết -> Ghi sổ tiếp công dân.',
    quizOptions: [
      'Ghi sổ trước rồi từ chối',
      'Đón tiếp -> Nghe trình bày -> Xem hồ sơ -> Giải quyết/hướng dẫn -> Ghi sổ tiếp công dân',
      'Chuyển cơ quan khác',
      'Hẹn lại lần sau'
    ],
    quizAnswer: 1,
    explanation: 'Luật Tiếp công dân 2013 và các thông tư hướng dẫn.',
    sortItems: [
      '1. Đón tiếp công dân và kiểm tra nhân thân',
      '2. Lắng nghe công dân trình bày nội dung',
      '3. Tiếp nhận, kiểm tra hồ sơ tài liệu',
      '4. Hướng dẫn hoặc xử lý khiếu nại, tố cáo, kiến nghị',
      '5. Ghi chép sổ tiếp công dân và thông báo kết quả'
    ],
    tags: ['tiếp công dân', 'quy trình']
  }
];

const AUTHORITATIVE_SHOP_ITEMS = [
  { id: 'desk_pink', name: 'Bàn Học Hồng', category: 'furniture', price: 25, cssClass: 'item-desk-pink', emoji: '🪑', description: 'Bàn pastel' },
  { id: 'shelf_wood', name: 'Kệ Sách Gỗ', category: 'furniture', price: 30, cssClass: 'item-shelf', emoji: '📚', description: 'Kệ đựng sách' },
  { id: 'chair_cute', name: 'Ghế Đệm Bông', category: 'furniture', price: 20, cssClass: 'item-chair', emoji: '💺', description: 'Ghế ngồi êm ái' },
  { id: 'bed_cozy', name: 'Giường Mini', category: 'furniture', price: 45, cssClass: 'item-bed', emoji: '🛏️', description: 'Giường cho pet' },
  { id: 'lamp_table', name: 'Đèn Bàn Học', category: 'lighting', price: 15, cssClass: 'item-lamp-table', emoji: '💡', description: 'Ánh sáng vàng dịu' },
  { id: 'lamp_fairy', name: 'Dây Đèn Fairy', category: 'lighting', price: 20, cssClass: 'item-lamp-fairy', emoji: '✨', description: 'Đèn đom đóm' },
  { id: 'lamp_ceil', name: 'Đèn Trần Tròn', category: 'lighting', price: 25, cssClass: 'item-lamp-ceil', emoji: '🏮', description: 'Đèn trần phong cách Hàn' },
  { id: 'cactus_pot', name: 'Xương Rồng Nhỏ', category: 'plant', price: 10, cssClass: 'item-cactus', emoji: '🌵', description: 'Xương rồng nhỏ xinh' },
  { id: 'tulip_vase', name: 'Bình Hoa Tulip', category: 'plant', price: 15, cssClass: 'item-tulip', emoji: '🌷', description: 'Hoa tulip hồng tươi' },
  { id: 'succulent_box', name: 'Sen Đá May Mắn', category: 'plant', price: 12, cssClass: 'item-succulent', emoji: '🪴', description: 'Sen đá thi đậu' },
  { id: 'ivy_wall', name: 'Dây Leo Tường', category: 'plant', price: 18, cssClass: 'item-ivy', emoji: '🌿', description: 'Dây thường xuân mát mắt' },
  { id: 'frame_photo', name: 'Khung Ảnh Miu', category: 'wall', price: 15, cssClass: 'item-frame', emoji: '🖼️', description: 'Khung ảnh kỷ niệm' },
  { id: 'clock_cat', name: 'Đồng Hồ Mèo', category: 'wall', price: 20, cssClass: 'item-clock', emoji: '⏰', description: 'Đồng hồ nhắc giờ học' },
  { id: 'poster_cheer', name: 'Poster Cố Lên', category: 'wall', price: 12, cssClass: 'item-poster', emoji: '📜', description: 'Nhất định đỗ viên chức!' },
  { id: 'calendar_desk', name: 'Lịch Đếm Ngược', category: 'wall', price: 15, cssClass: 'item-calendar', emoji: '📅', description: 'Đếm ngược ngày thi' },
  { id: 'wp_pink', name: 'Tường Hồng Pastel', category: 'wallpaper', price: 30, cssClass: 'wp-pink', emoji: '🎨', description: 'Tường hồng ngọt ngào' },
  { id: 'floor_wood', name: 'Sàn Gỗ Sáng Chuẩn Hàn', category: 'floor', price: 35, cssClass: 'floor-wood', emoji: '🪵', description: 'Sàn gỗ ấm áp' }
];

const AUTHORITATIVE_PETS = [
  { type: 'cat', name: 'Mèo Con', price: 0, cssClass: 'pet-cat', emoji: '🐱', personality: 'Tinh nghịch, hay leo trèo' },
  { type: 'bunny', name: 'Thỏ Con', price: 80, cssClass: 'pet-bunny', emoji: '🐰', personality: 'Nhút nhát nhưng siêu cute' },
  { type: 'bear', name: 'Gấu Bông', price: 100, cssClass: 'pet-bear', emoji: '🐻', personality: 'Hiền lành, hay ngủ nướng' },
  { type: 'duck', name: 'Vịt Con', price: 80, cssClass: 'pet-duck', emoji: '🦆', personality: 'Vui vẻ, hay lắc lư' },
  { type: 'hamster', name: 'Hamster', price: 120, cssClass: 'pet-hamster', emoji: '🐹', personality: 'Chăm chỉ chạy bánh xe' }
];

const AUTHORITATIVE_BADGES = [
  { id: 'first_lesson', name: 'Người Mới', icon: '🌟', condition: 'Hoàn thành bài học đầu tiên' },
  { id: 'streak_7', name: 'Kiên Trì', icon: '🔥', condition: 'Streak 7 ngày' },
  { id: 'perfect_quiz', name: 'Hoàn Hảo', icon: '💯', condition: '100% quiz' },
  { id: 'boss_hunter', name: 'Thợ Săn Boss', icon: '👹', condition: 'Thắng Boss lần đầu' },
  { id: 'decorator_10', name: 'Kiến Trúc Sư', icon: '🏠', condition: 'Mua 10 items' },
  { id: 'pet_lover_3', name: 'Bạn Của Thú', icon: '🐾', condition: 'Sở hữu 3 pet' },
  { id: 'scholar_50', name: 'Học Giả', icon: '📚', condition: '50 câu mastered' },
  { id: 'speed_demon', name: 'Tia Chớp', icon: '⚡', condition: '20+ câu trong Thi Tốc Độ' },
  { id: 'survivor_20', name: 'Bất Bại', icon: '🛡️', condition: '20+ câu trong Sống Sót' },
  { id: 'combo_10', name: 'Combo Master', icon: '🔥', condition: 'Combo 10+' }
];

const MOCK_DATA = {
  topics: AUTHORITATIVE_TOPICS,
  questions: AUTHORITATIVE_QUESTIONS,
  shopItems: AUTHORITATIVE_SHOP_ITEMS,
  petCatalog: AUTHORITATIVE_PETS,
  badges: AUTHORITATIVE_BADGES
};

const { createReferenceEngine } = require('./reference_engine');

/**
 * Loads GameEngine either from actual js/game.js (if exists) or returns reference oracle.
 */
function loadTestEngine(sandboxOptions = {}) {
  const sandbox = createBrowserEnvironment(sandboxOptions);
  const dataJsPath = path.join(ROOT_DIR, 'js', 'data.js');
  const gameJsPath = path.join(ROOT_DIR, 'js', 'game.js');

  let isTargetLive = false;

  if (fs.existsSync(dataJsPath)) {
    loadScriptIntoSandbox(dataJsPath, sandbox);
  } else {
    sandbox.DATA = MOCK_DATA;
    sandbox.window.DATA = MOCK_DATA;
  }

  if (fs.existsSync(gameJsPath)) {
    loadScriptIntoSandbox(gameJsPath, sandbox);
    isTargetLive = true;
  } else {
    // Provide authoritative reference oracle
    const refEngine = createReferenceEngine(sandbox);
    sandbox.GameEngine = refEngine;
    sandbox.window.GameEngine = refEngine;
  }

  const engine = sandbox.GameEngine || sandbox.window.GameEngine || null;
  return { sandbox, engine, data: sandbox.DATA || sandbox.window.DATA, isTargetLive };
}

module.exports = {
  ROOT_DIR,
  MOCK_DATA,
  AUTHORITATIVE_TOPICS,
  AUTHORITATIVE_QUESTIONS,
  AUTHORITATIVE_SHOP_ITEMS,
  AUTHORITATIVE_PETS,
  AUTHORITATIVE_BADGES,
  loadTestEngine
};
