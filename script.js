/**
 * VMAX Quotation Builder Tool - Application Scripts
 */

// --- ĐỐI TƯỢNG DỮ LIỆU MẪU MẶC ĐỊNH (DEFAULT DATA) ---
const DEFAULT_QUOTE_DATA = {
    company: {
        name: "CÔNG TY TNHH CÔNG NGHỆ SỐ VMAX",
        address: "Số 95 Hàng Phúc, Phường Yên Sở, Thành phố Hà Nội",
        taxId: "0111542408",
        hotline: "0825.99.33.55",
        email: "contact@vmaxtech.vn",
        website: "vmaxtech.vn",
        logoUrl: "assets/logo-vmax.png"
    },
    quotation: {
        title: "BẢNG BÁO GIÁ DỊCH VỤ VMAX",
        desc: "Chuyên thiết kế website, SEO và dịch vụ số toàn diện",
        code: "BG-2026-VMAX",
        date: "2026-07-16",
        dueDate: "2026-08-15",
        staff: "Nguyễn Văn A"
    },
    customer: {
        name: "MVP ACADEMY",
        contactName: "Mr. Khánh",
        phone: "0373.477.887",
        email: "contact@mvpacademy.edu.vn",
        address: "Số 124 ngõ 69 Tứ Liên, Tây Hồ, Hà Nội",
        serviceName: "Chỉnh sửa Website",
        projectName: "CHỈNH SỬA WEBSITE MVPACADEMY"
    },
    customerRows: [
        { id: "cust-name", label: "Tên khách hàng / doanh nghiệp:", value: "MVP ACADEMY", visible: true },
        { id: "cust-address", label: "Địa chỉ:", value: "Số 124 ngõ 69 Tứ Liên, Tây Hồ, Hà Nội", visible: true }
    ],
    items: [
        {
            title: "Tốc độ tải trang ổn định",
            description: "Đảm bảo trang web phản hồi nhanh dưới 2 giây.",
            bullets: []
        },
        {
            title: "Nâng cấp Hosting",
            description: "Chuyển sang nền tảng máy chủ chất lượng cao của VMAX.",
            bullets: [
                "Chuyển sang Hosting riêng (Private Hosting / VPS)",
                "VMAX quản trị toàn bộ website và các vấn đề xâm nhập",
                "Tự động backup dữ liệu và bảo mật cao",
                "Miễn phí sao lưu dự phòng và cài đặt chứng chỉ SSL"
            ]
        },
        {
            title: "Chuẩn Responsive Website",
            description: "Giao diện tự động tối ưu hóa hiển thị trên mọi thiết bị.",
            bullets: [
                "Hiển thị tốt trên máy tính",
                "Hiển thị tốt trên máy tính bảng",
                "Hiển thị tốt trên điện thoại"
            ]
        },
        {
            title: "Hiệu ứng chuyển động đẹp trên các danh mục hiển thị",
            description: "Tăng trải nghiệm tương tác trực quan cho khách hàng truy cập.",
            bullets: []
        },
        {
            title: "Nội dung chuẩn SEO cho các sản phẩm",
            description: "Tối ưu hóa các bài viết và sản phẩm chuẩn SEO Google.",
            bullets: []
        },
        {
            title: "Cập nhật dữ liệu Website",
            description: "Hỗ trợ di chuyển và cập nhật toàn bộ cơ sở dữ liệu.",
            bullets: [
                "Cập nhật hình ảnh theo yêu cầu",
                "Thay đổi và bổ sung nội dung",
                "Kiểm tra toàn bộ liên kết sau khi cập nhật",
                "VMAX chịu trách nhiệm xử lý các lỗi liên quan khi chuyển đổi"
            ]
        }
    ],
    pricing: {
        servicePrice: 3000000,
        vatPercent: 8,
        vatEnabled: true,
        discountPercent: 0,
        discountEnabled: false,
        extraFee: 0,
        extraEnabled: false,
        currency: "VNĐ",
        wordValue: "Ba triệu hai trăm bốn mươi nghìn đồng"
    },
    timeline: {
        duration: "1-3 ngày",
        startDate: "2026-07-16",
        endDate: "2026-07-19",
        notes: "Báo giá đã bao gồm các chi phí tối ưu hóa SEO cơ bản.",
        paymentTerms: "Tạm ứng 50% sau khi ký hợp đồng, 50% sau khi bàn giao nghiệm thu.",
        warranty: "Bảo hành 12 tháng kể từ ngày nghiệm thu bàn giao sản phẩm.",
        signatureEnabled: true,
        signatureCustImgUrl: "",
        signatureCompImgUrl: ""
    },
    activeTemplate: "preset-web"
};

// State hiện tại của ứng dụng
let quoteData = {};
let currentZoom = 100;
let autosaveTimer = null;
let isComposing = false; // Trạng thái gõ tiếng Việt TELEX / Unikey (IME)

// Đăng ký bắt sự kiện IME composition toàn cục để bảo vệ nhập tiếng Việt
document.addEventListener("compositionstart", () => {
    isComposing = true;
});
document.addEventListener("compositionend", () => {
    isComposing = false;
    triggerAutosave(1000);
});

/**
 * Lưu vị trí con trỏ và vùng chọn khi cần render lại DOM
 */
function saveSelection(containerEl) {
    try {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        const activeEl = document.activeElement;
        if (!activeEl || !containerEl || !containerEl.contains(activeEl)) return null;

        return {
            activeId: activeEl.id,
            activeClass: activeEl.className,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            scrollTop: window.scrollY || document.documentElement.scrollTop
        };
    } catch (e) {
        return null;
    }
}

/**
 * Khôi phục vị trí con trỏ và vùng chọn sau khi render DOM
 */
function restoreSelection(savedState, containerEl) {
    if (!savedState || !containerEl) return;
    try {
        let target = null;
        if (savedState.activeId) {
            target = document.getElementById(savedState.activeId);
        }
        if (!target && savedState.activeClass) {
            const classSel = savedState.activeClass.split(' ').filter(Boolean).join('.');
            if (classSel) target = containerEl.querySelector(`.${classSel}`);
        }
        if (target) {
            target.focus();
            const sel = window.getSelection();
            const range = document.createRange();
            if (target.childNodes.length > 0) {
                const node = target.childNodes[0];
                const maxLen = node.length || 0;
                range.setStart(node, Math.min(savedState.startOffset, maxLen));
                range.setEnd(node, Math.min(savedState.endOffset, maxLen));
            } else {
                range.selectNodeContents(target);
            }
            sel.removeAllRanges();
            sel.addRange(range);
        }
        if (savedState.scrollTop !== undefined) {
            window.scrollTo(0, savedState.scrollTop);
        }
    } catch (e) {
        // Safe fallback
    }
}

// Quản lý Undo / Redo theo từng mẫu báo giá riêng biệt (Per-template Stacks)
const perTemplateUndoStacks = {};
const perTemplateRedoStacks = {};
const MAX_STACK_SIZE = 50;
let isUndoRedoOperation = false;

function getActiveUndoStack() {
    const key = quoteData.activeTemplate || 'preset-web';
    if (!perTemplateUndoStacks[key]) perTemplateUndoStacks[key] = [];
    return perTemplateUndoStacks[key];
}

function getActiveRedoStack() {
    const key = quoteData.activeTemplate || 'preset-web';
    if (!perTemplateRedoStacks[key]) perTemplateRedoStacks[key] = [];
    return perTemplateRedoStacks[key];
}

// --- HỆ THỐNG MẪU BÁO GIÁ NHANH (PRESETS & CUSTOM TEMPLATES) ---
const PRESET_TEMPLATES = {
    "preset-web": {
        quotation: {
            title: "BẢNG BÁO GIÁ THIẾT KẾ WEBSITE CHUYÊN NGHIỆP",
            desc: "Dịch vụ thiết kế website chuẩn SEO, responsive và tối ưu hiệu năng cao",
            code: "BG-2026-WEB",
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            staff: "Nguyễn Văn A"
        },
        customer: {
            name: "MVP ACADEMY",
            contactName: "Mr. Khánh",
            phone: "0373.477.887",
            email: "contact@mvpacademy.edu.vn",
            address: "Số 124 ngõ 69 Tứ Liên, Tây Hồ, Hà Nội",
            serviceName: "Thiết kế Website",
            projectName: "THIẾT KẾ WEBSITE DOANH NGHIỆP"
        },
        customerRows: [
            { id: "cust-name", label: "Tên khách hàng / doanh nghiệp:", value: "MVP ACADEMY", visible: true },
            { id: "cust-phone", label: "Số điện thoại:", value: "0373.477.887", visible: true },
            { id: "cust-address", label: "Địa chỉ:", value: "Số 124 ngõ 69 Tứ Liên, Tây Hồ, Hà Nội", visible: true }
        ],
        items: [
            {
                title: "Thiết kế giao diện UI/UX độc quyền",
                description: "Thiết kế giao diện chuẩn thương hiệu, tối ưu trải nghiệm người dùng.",
                bullets: [
                    "Giao diện độc quyền chuẩn thương hiệu VMAX",
                    "Tối ưu hóa hành trình khách hàng và tỷ lệ chuyển đổi",
                    "Hỗ trợ giao diện Responsive tương thích Desktop, Tablet và Mobile"
                ],
                cells: { "col-title": "Thiết kế giao diện UI/UX độc quyền", "col-desc": "Thiết kế giao diện chuẩn thương hiệu, tối ưu trải nghiệm người dùng.", "col-price": "" }
            },
            {
                title: "Lập trình Front-end & Tối ưu hóa tải trang",
                description: "Sử dụng công nghệ hiện đại đảm bảo trang web chạy mượt và nhanh dưới 2 giây.",
                bullets: [
                    "Sử dụng mã nguồn tối ưu HTML5, CSS3, ES6",
                    "Chuẩn SEO On-page ngay từ cấu trúc thẻ HTML",
                    "Nén ảnh tự động và lazy-loading tăng tốc độ truy cập"
                ],
                cells: { "col-title": "Lập trình Front-end & Tối ưu hóa tải trang", "col-desc": "Sử dụng công nghệ hiện đại đảm bảo trang web chạy mượt và nhanh dưới 2 giây.", "col-price": "" }
            },
            {
                title: "Chuẩn Responsive Website",
                description: "Hiển thị tương thích và tối ưu trên mọi kích thước màn hình thiết bị.",
                bullets: [
                    "Hiển thị tốt trên máy tính",
                    "Hiển thị tốt trên máy tính bảng",
                    "Hiển thị tốt trên điện thoại"
                ],
                cells: { "col-title": "Chuẩn Responsive Website", "col-desc": "Hiển thị tương thích và tối ưu trên mọi kích thước màn hình thiết bị.", "col-price": "" }
            },
            {
                title: "Lập trình hệ thống quản trị Back-end bảo mật",
                description: "Trang quản trị trực quan, dễ quản lý nội dung và an toàn tuyệt đối.",
                bullets: [
                    "Quản lý danh mục bài viết, dịch vụ, sản phẩm dễ dàng",
                    "Bảo mật đa lớp, chống xâm nhập trái phép",
                    "Tự động backup dữ liệu hàng tuần lên cloud"
                ],
                cells: { "col-title": "Lập trình hệ thống quản trị Back-end bảo mật", "col-desc": "Trang quản trị trực quan, dễ quản lý nội dung và an toàn tuyệt đối.", "col-price": "" }
            },
            {
                title: "Cấu hình Server & Tên miền quốc tế",
                description: "Bàn giao hạ tầng vận hành ổn định lâu dài.",
                bullets: [
                    "Miễn phí 1 năm sử dụng Hosting SSD dung lượng cao tốc độ cao",
                    "Tặng tên miền quốc tế (.com hoặc .net) trong năm đầu",
                    "Cài đặt chứng chỉ bảo mật SSL (HTTPS) miễn phí"
                ],
                cells: { "col-title": "Cấu hình Server & Tên miền quốc tế", "col-desc": "Bàn giao hạ tầng vận hành ổn định lâu dài.", "col-price": "" }
            },
            {
                title: "Bàn giao & Hỗ trợ kỹ thuật trọn đời",
                description: "Đồng hành cùng khách hàng trong suốt quá trình vận hành.",
                bullets: [
                    "Bàn giao toàn bộ mã nguồn gốc và tài liệu hướng dẫn sử dụng",
                    "Hỗ trợ kỹ thuật, khắc phục sự cố phát sinh 24/7",
                    "Bảo hành trọn đời mã nguồn website"
                ],
                cells: { "col-title": "Bàn giao & Hỗ trợ kỹ thuật trọn đời", "col-desc": "Đồng hành cùng khách hàng trong suốt quá trình vận hành.", "col-price": "" }
            }
        ],
        pricing: {
            servicePrice: 15000000,
            vatPercent: 8,
            vatEnabled: true,
            discountPercent: 0,
            discountEnabled: false,
            extraFee: 0,
            extraEnabled: false,
            currency: "VNĐ",
            wordValue: "Mười sáu triệu hai trăm nghìn đồng"
        },
        timeline: {
            duration: "10-15 NGÀY",
            paymentTerms: [
                "Đợt 1: Tạm ứng 50% ngay sau khi ký hợp đồng",
                "Đợt 2: Thanh toán 50% còn lại sau khi nghiệm thu và bàn giao website"
            ],
            notes: [
                "Báo giá chưa bao gồm thuế VAT 8% (nếu lấy hóa đơn)",
                "Báo giá có giá trị trong vòng 30 ngày kể từ ngày ban hành"
            ],
            signatureEnabled: true,
            signatureCustImgUrl: "",
            signatureCompImgUrl: ""
        }
    },
    "preset-seo": {
        quotation: {
            title: "BẢNG BÁO GIÁ DỊCH VỤ SEO TỔNG THỂ",
            desc: "Giải pháp tối ưu hóa công cụ tìm kiếm giúp tăng trưởng lưu lượng truy cập tự nhiên bền vững",
            code: "BG-2026-SEO",
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            staff: "Nguyễn Văn A"
        },
        customer: {
            name: "MVP ACADEMY",
            contactName: "Mr. Khánh",
            phone: "0373.477.887",
            email: "contact@mvpacademy.edu.vn",
            address: "Số 124 ngõ 69 Tứ Liên, Tây Hồ, Hà Nội",
            serviceName: "Dịch vụ SEO",
            projectName: "DỊCH VỤ SEO TỔNG THỂ WEBSITE"
        },
        customerRows: [
            { id: "cust-name", label: "Tên khách hàng / doanh nghiệp:", value: "MVP ACADEMY", visible: true },
            { id: "cust-phone", label: "Số điện thoại:", value: "0373.477.887", visible: true },
            { id: "cust-address", label: "Địa chỉ:", value: "Số 124 ngõ 69 Tứ Liên, Tây Hồ, Hà Nội", visible: true }
        ],
        items: [
            {
                title: "Kiểm tra kỹ thuật & Lập chiến lược từ khóa",
                description: "Nghiên cứu thị trường, từ khóa chuyển đổi cao và tối ưu hệ thống kỹ thuật SEO.",
                bullets: [
                    "Technical SEO Audit: Tối ưu cấu trúc link, sitemap, robots.txt, schema",
                    "Phân tích bộ từ khóa chính, từ khóa phụ và từ khóa chuyển đổi cao",
                    "Đánh giá chi tiết ưu/nhược điểm đối thủ cạnh tranh trực tiếp"
                ],
                cells: { "col-title": "Kiểm tra kỹ thuật & Lập chiến lược từ khóa", "col-desc": "Nghiên cứu thị trường, từ khóa chuyển đổi cao và tối ưu hệ thống kỹ thuật SEO.", "col-price": "" }
            },
            {
                title: "Tối ưu hóa On-page & Trải nghiệm người dùng",
                description: "Nâng cao chất lượng trải nghiệm trang giúp giữ chân người dùng lâu hơn.",
                bullets: [
                    "Tối ưu Title, Meta Description, Heading (H1-H6) chuẩn SEO",
                    "Tối ưu tốc độ tải trang, nâng điểm chất lượng Google PageSpeed Insights",
                    "Tối ưu hóa các liên kết nội bộ (Internal Link Structure)"
                ],
                cells: { "col-title": "Tối ưu hóa On-page & Trải nghiệm người dùng", "col-desc": "Nâng cao chất lượng trải nghiệm trang giúp giữ chân người dùng lâu hơn.", "col-price": "" }
            },
            {
                title: "Xây dựng nội dung chuẩn SEO chuyên sâu",
                description: "Sản xuất nội dung giá trị, giữ chân khách hàng và khẳng định uy tín thương hiệu.",
                bullets: [
                    "Lên kế hoạch nội dung chi tiết theo mô hình Topic Cluster (cụm chủ đề)",
                    "Viết các bài viết chuyên sâu độc quyền chuẩn SEO",
                    "Thiết kế hình ảnh minh họa chất lượng cao đi kèm mỗi bài viết"
                ],
                cells: { "col-title": "Xây dựng nội dung chuẩn SEO chuyên sâu", "col-desc": "Sản xuất nội dung giá trị, giữ chân khách hàng và khẳng định uy tín thương hiệu.", "col-price": "" }
            },
            {
                title: "Tối ưu hóa Off-page & Định danh thương hiệu (Entity)",
                description: "Xây dựng uy tín và sức mạnh liên kết bên ngoài cho website.",
                bullets: [
                    "Đồng bộ hóa thực thể thương hiệu trên social media (Entity SEO)",
                    "Xây dựng backlinks chất lượng từ báo chí và site vệ tinh uy tín",
                    "Tối ưu hóa Google Business Profile (Local SEO)"
                ],
                cells: { "col-title": "Tối ưu hóa Off-page & Định danh thương hiệu (Entity)", "col-desc": "Xây dựng uy tín và sức mạnh liên kết bên ngoài cho website.", "col-price": "" }
            },
            {
                title: "Đo lường & Báo cáo kết quả hàng tháng",
                description: "Minh bạch hóa số liệu, thứ hạng và tăng trưởng lưu lượng truy cập.",
                bullets: [
                    "Báo cáo chi tiết thứ hạng từ khóa định kỳ hàng tháng",
                    "Báo cáo tăng trưởng traffic tự nhiên thông qua Google Search Console & Analytics",
                    "Cam kết KPI cụ thể theo từng giai đoạn thực hiện"
                ],
                cells: { "col-title": "Đo lường & Báo cáo kết quả hàng tháng", "col-desc": "Minh bạch hóa số liệu, thứ hạng và tăng trưởng lưu lượng truy cập.", "col-price": "" }
            }
        ],
        pricing: {
            servicePrice: 8000000,
            vatPercent: 8,
            vatEnabled: true,
            discountPercent: 0,
            discountEnabled: false,
            extraFee: 0,
            extraEnabled: false,
            currency: "VNĐ/tháng",
            wordValue: "Tám triệu sáu trăm cao tư mười nghìn đồng"
        },
        timeline: {
            duration: "HÀNG THÁNG (HỢP ĐỒNG TỐI THIỂU 6 THÁNG)",
            paymentTerms: [
                "Thanh toán phí dịch vụ định kỳ vào ngày 05 hàng tháng",
                "Tạm ứng phí dịch vụ tháng đầu tiên ngay sau khi ký kết hợp đồng"
            ],
            notes: [
                "Báo giá chưa bao gồm thuế VAT 8% (nếu lấy hóa đơn)",
                "KPI từ khóa sẽ được cam kết rõ ràng trong phụ lục hợp đồng"
            ],
            signatureEnabled: true
        }
    }
};

// --- KHỞI CHẠY ỨNG DỤNG (ENTRY POINT) ---
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    
    // Đăng ký tự động đồng bộ và lưu dữ liệu trước khi thoát ứng dụng
    window.addEventListener("beforeunload", () => {
        updateQuoteData();
        saveDraft(false);
    });
});

/**
 * Hàm log chẩn đoán trạng thái items theo yêu cầu kiểm tra
 */
function logQuoteState(stage, activeTemplate, draftKey, source) {
    const itemsCount = quoteData && quoteData.items ? quoteData.items.length : 0;
    const itemTitles = quoteData && quoteData.items ? quoteData.items.map(it => it.title || "Chưa đặt tên") : [];
    console.log(`[VMAX DIAGNOSTIC LOG][${stage}]`, {
        activeTemplate: activeTemplate || (quoteData && quoteData.activeTemplate),
        draftKey: draftKey || getTemplateDraftKey(activeTemplate || (quoteData && quoteData.activeTemplate)),
        itemsCount: itemsCount,
        itemTitles: itemTitles,
        source: source || "N/A"
    });
}

/**
 * Khởi tạo ứng dụng
 */
function initApp() {
    // 1. Xác định mẫu đang hoạt động (Mặc định: preset-web)
    const activeTemplate = localStorage.getItem("vmax_quote_active_template") || "preset-web";
    const draftKey = getTemplateDraftKey(activeTemplate);
    let savedDraft = localStorage.getItem(draftKey);
    
    // Migration: Nếu key riêng chưa có nhưng key chung legacy (vmax_quote_draft) có dữ liệu
    if (!savedDraft) {
        const legacyDraft = localStorage.getItem("vmax_quote_draft");
        if (legacyDraft) {
            try {
                const legacyData = JSON.parse(legacyDraft);
                const legacyTemplate = legacyData.activeTemplate || "preset-web";
                if (legacyTemplate === activeTemplate) {
                    localStorage.setItem(draftKey, legacyDraft);
                    if (localStorage.getItem(draftKey) === legacyDraft) {
                        savedDraft = legacyDraft;
                        console.log(`[VMAX MIGRATION] Legacy draft safely copied to ${draftKey}`);
                    }
                }
            } catch (err) {
                console.error("[VMAX MIGRATION ERROR]", err);
            }
        }
    }
    
    logQuoteState("INIT 1. Trước khi tải bản nháp khởi động", activeTemplate, draftKey, savedDraft ? "Có nháp trong localStorage" : "Không có nháp");

    if (savedDraft) {
        try {
            const parsedDraft = JSON.parse(savedDraft);
            const defaultForTemplate = loadDefaultTemplateData(activeTemplate);
            quoteData = mergeDeep({}, defaultForTemplate, parsedDraft);
            logQuoteState("INIT 2a. Đã nạp nháp riêng từ localStorage", activeTemplate, draftKey, "JSON.parse + mergeDeep");
        } catch (e) {
            quoteData = loadDefaultTemplateData(activeTemplate);
            logQuoteState("INIT 2c. Catch lỗi nháp - nạp default", activeTemplate, draftKey, "loadDefaultTemplateData");
        }
    } else {
        quoteData = loadDefaultTemplateData(activeTemplate);
        logQuoteState("INIT 2d. Không có nháp - nạp default", activeTemplate, draftKey, "loadDefaultTemplateData");
    }
    quoteData.activeTemplate = activeTemplate;

    // Thực hiện di trú dữ liệu cũ sang cấu trúc mới
    if (!quoteData.customerRows) {
        quoteData.customerRows = [
            { id: "cust-name", label: "Tên khách hàng / doanh nghiệp:", value: quoteData.customer?.name || "MVP ACADEMY", visible: true },
            { id: "cust-phone", label: "Số điện thoại:", value: quoteData.customer?.phone || "0373.477.887", visible: true },
            { id: "cust-address", label: "Địa chỉ:", value: quoteData.customer?.address || "Số 124 ngõ 69 Tứ Liên, Tây Hồ, Hà Nội", visible: true }
        ];
    }
    const isCorruptedOrMissing = (!quoteData._initialized && (!quoteData.items || quoteData.items.length === 0)) || quoteData.items === undefined || quoteData.items === null;

    if (isCorruptedOrMissing && !quoteData._userClearedItems) {
        const defaultItems = PRESET_TEMPLATES[activeTemplate]?.items || DEFAULT_QUOTE_DATA.items;
        quoteData.items = JSON.parse(JSON.stringify(defaultItems));
        quoteData._initialized = true;
        quoteData._userClearedItems = false;
        logQuoteState("INIT 3. Đã khôi phục default items do dữ liệu cũ/lỗi", activeTemplate, draftKey, "Fallback items");
    } else {
        quoteData._initialized = true;
        logQuoteState("INIT 3. Giữ nguyên mảng items hiện tại", activeTemplate, draftKey, "Existing items preserved");
    }

    if (quoteData.items && Array.isArray(quoteData.items)) {
        quoteData.items.forEach(item => {
            if (item.cells) {
                if ((!item.title || !item.title.trim()) && item.cells["col-title"]) {
                    item.title = item.cells["col-title"];
                }
                if ((!item.description || !item.description.trim()) && item.cells["col-desc"]) {
                    item.description = item.cells["col-desc"];
                }
            }
            if (!item.bullets) {
                item.bullets = [];
            }
        });
    }

    logQuoteState("INIT 4. Trước khi render UI khởi động", activeTemplate, draftKey, "Final state before render");

    // 2. Tái tạo lại danh sách hạng mục trên Sidebar & Form
    rebuildItemsSidebarList(true);
    fillFormFromData();

    // 3. Khởi tạo kéo thả SortableJS cho hạng mục
    initSortable();

    // 4. Liên kết các sự kiện UI
    bindEvents();

    // Thiết lập chế độ chỉnh sửa trực tiếp mặc định là bật
    document.getElementById("vmax-quote-page-print").classList.add("vmax-quote-editable-active");

    // 5. Tính toán chi phí và hiển thị bản xem trước
    calculatePricing();
    renderPreview();

    // Khởi tạo trình quản lý mẫu báo giá nhanh
    initTemplateManager();

    // 6. Mở rộng accordion mặc định đầu tiên
    document.querySelector(".vmax-quote-accordion-header").click();
}

/**
 * Liên kết các sự kiện trong ứng dụng
 */
function bindEvents() {
    const editor = document.querySelector(".vmax-quote-editor");

    // Sự kiện focus vào ô nhập liệu để lưu Undo state trước khi người dùng gõ
    editor.addEventListener("focusin", (e) => {
        pushUndoState();
    });

    // Sự kiện input thay đổi dữ liệu trong form (Tự động cập nhật Preview theo thời gian thực)
    editor.addEventListener("input", (e) => {
        updateQuoteData();
        triggerAutosave();
    });

    editor.addEventListener("change", (e) => {
        pushUndoState();
        updateQuoteData();
        triggerAutosave();
    });

    // Toggle hiển thị VAT/Chiết khấu/Phát sinh
    document.getElementById("price-vat-enabled").addEventListener("change", (e) => {
        const container = document.getElementById("vat-percent-container");
        container.style.display = e.target.checked ? "flex" : "none";
        calculatePricing();
        renderPreview();
    });

    document.getElementById("price-discount-enabled").addEventListener("change", (e) => {
        const container = document.getElementById("discount-percent-container");
        container.style.display = e.target.checked ? "flex" : "none";
        calculatePricing();
        renderPreview();
    });

    document.getElementById("price-extra-enabled").addEventListener("change", (e) => {
        const container = document.getElementById("extra-fee-container");
        container.style.display = e.target.checked ? "flex" : "none";
        calculatePricing();
        renderPreview();
    });

    // Upload logo
    document.getElementById("comp-logo").addEventListener("change", handleLogoUpload);

    // Upload signature
    const custSigInput = document.getElementById("signature-cust-img");
    if (custSigInput) {
        custSigInput.addEventListener("change", handleCustSignatureUpload);
    }
    const compSigInput = document.getElementById("signature-comp-img");
    if (compSigInput) {
        compSigInput.addEventListener("change", handleCompSignatureUpload);
    }

    // --- LẮNG NGHE SỰ KIỆN BẤM TRỰC TIẾP VÀO ẢNH ĐỂ MỞ THƯ MỤC CHỌN TỆP TỪ MÁY TÍNH ---
    
    // 1. Chọn ảnh Logo khi bấm vào Logo trên Preview (A4), Header hoặc Sidebar
    const logoElements = [
        document.getElementById("vmax-quote-page-logo-preview"),
        document.getElementById("vmax-quote-header-logo-img"),
        document.querySelector(".vmax-quote-page-header-logo-container"),
        document.getElementById("comp-logo-name")
    ];
    logoElements.forEach(el => {
        if (el) {
            el.title = "Bấm vào đây để chọn tệp logo mới từ máy tính";
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                const logoInput = document.getElementById("comp-logo");
                if (logoInput) logoInput.click();
            });
        }
    });

    // 2. Chọn ảnh Chữ ký Khách hàng khi bấm vào khung/ảnh chữ ký KH trên Preview hoặc Sidebar
    const custSigLabels = document.querySelectorAll('label[for="signature-cust-img"], #signature-cust-img-name');
    custSigLabels.forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (custSigInput) custSigInput.click();
        });
    });

    const custSigImg = document.getElementById("vmax-quote-signature-cust-preview-img");
    const custSigSpace = document.querySelector(".vmax-quote-signature-col:first-child .vmax-quote-signature-space");
    const custSigName = document.getElementById("signature-cust-img-name");

    [custSigImg, custSigSpace, custSigName].forEach(el => {
        if (el) {
            el.title = "Bấm vào đây để chọn tệp chữ ký Khách hàng từ máy tính";
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                if (custSigInput) custSigInput.click();
            });
        }
    });

    // 3. Chọn ảnh Chữ ký VMAX khi bấm vào khung/ảnh chữ ký VMAX trên Preview hoặc Sidebar
    const compSigLabels = document.querySelectorAll('label[for="signature-comp-img"], #signature-comp-img-name');
    compSigLabels.forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (compSigInput) compSigInput.click();
        });
    });

    const compSigImg = document.getElementById("vmax-quote-signature-comp-preview-img");
    const compSigSpace = document.querySelector(".vmax-quote-signature-col:last-child .vmax-quote-signature-space");
    const compSigName = document.getElementById("signature-comp-img-name");

    [compSigImg, compSigSpace, compSigName].forEach(el => {
        if (el) {
            el.title = "Bấm vào đây để chọn tệp chữ ký VMAX từ máy tính";
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                if (compSigInput) compSigInput.click();
            });
        }
    });

    // Ủy quyền sự kiện (Event delegation) trên A4 Preview page để bắt cú click kể cả khi DOM được cập nhật
    const pagePrint = document.getElementById("vmax-quote-page-print");
    if (pagePrint) {
        pagePrint.addEventListener("click", (e) => {
            const logoTarget = e.target.closest("#vmax-quote-page-logo-preview") || e.target.closest(".vmax-quote-page-header-logo-container");
            if (logoTarget) {
                document.getElementById("comp-logo").click();
                return;
            }

            const custSigTarget = e.target.closest("#vmax-quote-signature-cust-preview-img") || e.target.closest(".vmax-quote-signature-col:first-child .vmax-quote-signature-space");
            if (custSigTarget) {
                document.getElementById("signature-cust-img").click();
                return;
            }

            const compSigTarget = e.target.closest("#vmax-quote-signature-comp-preview-img") || e.target.closest(".vmax-quote-signature-col:last-child .vmax-quote-signature-space");
            if (compSigTarget) {
                document.getElementById("signature-comp-img").click();
                return;
            }
        });
    }

    // Accordions Toggle cá nhân (Single-Open Accordion)
    const accordionHeaders = document.querySelectorAll(".vmax-quote-accordion-header");
    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute("aria-expanded") === "true";

            // Thu gọn tất cả các accordion khác trước khi mở cái mới
            if (!isExpanded) {
                document.querySelectorAll(".vmax-quote-accordion-item").forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove("vmax-quote-active");
                        const otherHeader = otherItem.querySelector(".vmax-quote-accordion-header");
                        const otherContent = otherItem.querySelector(".vmax-quote-accordion-content");
                        if (otherHeader) otherHeader.setAttribute("aria-expanded", "false");
                        if (otherContent) otherContent.style.display = "none";
                    }
                });
            }

            header.setAttribute("aria-expanded", !isExpanded);
            if (isExpanded) {
                content.style.display = "none";
                item.classList.remove("vmax-quote-active");
            } else {
                content.style.display = "block";
                item.classList.add("vmax-quote-active");
                
                // Tự động cuộn đến phần vừa mở rộng (mượt mà)
                setTimeout(() => {
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 150);
            }
        });
    });

    // Accordions Mở rộng / Thu gọn toàn bộ
    document.getElementById("vmax-quote-btn-expand-all").addEventListener("click", () => {
        document.querySelectorAll(".vmax-quote-accordion-item").forEach(item => {
            item.classList.add("vmax-quote-active");
            item.querySelector(".vmax-quote-accordion-header").setAttribute("aria-expanded", "true");
            item.querySelector(".vmax-quote-accordion-content").style.display = "block";
        });
    });

    document.getElementById("vmax-quote-btn-collapse-all").addEventListener("click", () => {
        document.querySelectorAll(".vmax-quote-accordion-item").forEach(item => {
            item.classList.remove("vmax-quote-active");
            item.querySelector(".vmax-quote-accordion-header").setAttribute("aria-expanded", "false");
            item.querySelector(".vmax-quote-accordion-content").style.display = "none";
        });
    });

    // Thêm hạng mục công việc
    document.getElementById("vmax-quote-btn-add-item-trigger").addEventListener("click", () => {
        addNewItem();
    });

    // Thêm dòng thông tin khách hàng
    document.getElementById("vmax-quote-btn-add-customer-row").addEventListener("click", () => {
        addNewCustomerRow();
    });

    // Zoom bản xem trước A4
    document.getElementById("vmax-quote-zoom-in").addEventListener("click", () => {
        adjustZoom(10);
    });

    document.getElementById("vmax-quote-zoom-out").addEventListener("click", () => {
        adjustZoom(-10);
    });

    document.getElementById("vmax-quote-zoom-val").addEventListener("click", () => {
        // Vòng lặp zoom giữa 75% -> 90% -> 100%
        if (currentZoom === 100) adjustZoom(-10); // Sang 90%
        else if (currentZoom === 90) adjustZoom(-15); // Sang 75%
        else adjustZoom(40); // Quay lại 100% (75 + 40 = 115 -> chỉnh về 100)
    });

    // Chế độ chỉnh sửa trực tiếp trên bản xem trước (Contenteditable) đã được bật mặc định

    // Kênh bắt sự kiện input & IME của Contenteditable trên bản xem trước
    const previewPrintEl = document.getElementById("vmax-quote-page-print");
    if (previewPrintEl) {
        previewPrintEl.addEventListener("input", handlePreviewDirectInput);
        previewPrintEl.addEventListener("compositionstart", () => { isComposing = true; });
        previewPrintEl.addEventListener("compositionend", () => {
            isComposing = false;
            triggerAutosave(1000);
        });
        previewPrintEl.addEventListener("focusout", (e) => {
            if (e.target && (e.target.isContentEditable || e.target.tagName === "INPUT")) {
                updateQuoteData({ renderPreview: false });
                triggerAutosave(500);
            }
        });
    }

    // Phím tắt / Action buttons chính ở header & footer
    const undoBtn = document.getElementById("vmax-quote-btn-undo");
    if (undoBtn) undoBtn.addEventListener("click", undo);
    
    const redoBtn = document.getElementById("vmax-quote-btn-redo");
    if (redoBtn) redoBtn.addEventListener("click", redo);

    // Bắt phím tắt Ctrl+Z và Ctrl+Y / Ctrl+Shift+Z toàn cục
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
            const isInput = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable);
            if (!isInput) {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            }
        } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
            const isInput = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable);
            if (!isInput) {
                e.preventDefault();
                redo();
            }
        }
    });

    document.getElementById("vmax-quote-btn-save").addEventListener("click", () => saveDraft(true));
    document.getElementById("vmax-quote-btn-mob-save").addEventListener("click", () => saveDraft(true));
    
    const restoreBtn = document.getElementById("vmax-quote-btn-restore");
    if (restoreBtn) restoreBtn.addEventListener("click", restoreDraft);
    
    document.getElementById("vmax-quote-btn-reset").addEventListener("click", resetQuote);
    
    document.getElementById("vmax-quote-btn-export-pdf").addEventListener("click", exportToPDF);
    document.getElementById("vmax-quote-btn-mob-export").addEventListener("click", exportToPDF);
    document.getElementById("vmax-quote-btn-export-word").addEventListener("click", exportToWord);
    
    document.getElementById("vmax-quote-btn-print").addEventListener("click", printQuote);
    document.getElementById("vmax-quote-btn-mob-print").addEventListener("click", printQuote);

    // Ràng buộc sự kiện cho các nút ở chân sidebar cố định
    const sideSave = document.getElementById("vmax-quote-sidebar-btn-save");
    if (sideSave) sideSave.addEventListener("click", () => saveDraft(true));
    
    const sidePrint = document.getElementById("vmax-quote-sidebar-btn-print");
    if (sidePrint) sidePrint.addEventListener("click", printQuote);
    
    const sidePdf = document.getElementById("vmax-quote-sidebar-btn-export-pdf");
    if (sidePdf) sidePdf.addEventListener("click", exportToPDF);
    
    const sideWord = document.getElementById("vmax-quote-sidebar-btn-export-word");
    if (sideWord) sideWord.addEventListener("click", exportToWord);

    // Ràng buộc sự kiện cho Sao lưu & Khôi phục cấu hình
    const backupSaveBtn = document.getElementById("vmax-quote-btn-backup-save");
    if (backupSaveBtn) backupSaveBtn.addEventListener("click", backupData);

    const backupLoadBtn = document.getElementById("vmax-quote-btn-backup-load");
    if (backupLoadBtn) backupLoadBtn.addEventListener("click", restoreData);

    // Preview Fullscreen modal (cho mobile/tablet)
    const floatPreviewBtn = document.getElementById("vmax-quote-floating-preview-btn");
    const previewModal = document.getElementById("vmax-quote-preview-modal");
    const previewModalClose = document.getElementById("vmax-quote-preview-modal-btn-close");
    const previewModalPrint = document.getElementById("vmax-quote-preview-modal-btn-print");
    const previewModalBody = document.getElementById("vmax-quote-preview-modal-body-content");

    floatPreviewBtn.addEventListener("click", () => {
        // Di chuyển / Clone trang A4 vào trong modal body
        const originalPage = document.getElementById("vmax-quote-page-print");
        
        // Thiết lập tỉ lệ thu nhỏ phù hợp cho điện thoại khi trong modal
        originalPage.style.transform = "scale(0.55)";
        if (window.innerWidth < 480) {
            originalPage.style.transform = "scale(0.42)";
        }
        
        previewModalBody.appendChild(originalPage);
        previewModal.style.display = "flex";
    });

    const closeMobilePreview = () => {
        const originalPage = previewModalBody.querySelector("#vmax-quote-page-print");
        if (originalPage) {
            // Đưa trang A4 trở lại preview wrap ban đầu
            document.getElementById("vmax-quote-preview-wrapper-id").appendChild(originalPage);
        }
        applyZoom(); // Reset zoom về tỉ lệ desktop hiện tại
        previewModal.style.display = "none";
    };

    previewModalClose.addEventListener("click", closeMobilePreview);
    previewModalPrint.addEventListener("click", () => {
        printQuote();
    });

    // Toàn màn hình trên Desktop
    document.getElementById("vmax-quote-btn-preview-fullscreen").addEventListener("click", () => {
        const wrap = document.getElementById("vmax-quote-preview-wrapper-id");
        if (!document.fullscreenElement) {
            wrap.requestFullscreen().catch(err => {
                showToast("Không thể mở toàn màn hình: " + err.message, "danger");
            });
        } else {
            document.exitFullscreen();
        }
    });

}

// --- XỬ LÝ ACCORDION & INPUT HẠNG MỤC ---

/**
 * Khởi tạo SortableJS cho phần Hạng mục công việc ở sidebar
 */
let sortableInstance = null;
function initSortable() {
    const list = document.getElementById("vmax-quote-items-list");
    if (sortableInstance) {
        sortableInstance.destroy();
    }
    
    sortableInstance = Sortable.create(list, {
        handle: ".vmax-quote-item-drag-handle",
        ghostClass: "vmax-quote-item-ghost",
        animation: 150,
        onEnd: () => {
            // Sắp xếp lại mảng dữ liệu dựa trên thứ tự DOM mới
            const newItems = [];
            const cards = list.querySelectorAll(".vmax-quote-item-editor-card");
            cards.forEach(card => {
                const idx = parseInt(card.dataset.tempIdx);
                if (quoteData.items && quoteData.items[idx]) {
                    newItems.push(quoteData.items[idx]);
                }
            });
            quoteData.items = newItems;
            
            // Render lại preview A4 và dựng lại hoàn toàn danh sách sidebar để đồng bộ chỉ mục và event handlers
            renderItemsPreview();
            rebuildItemsSidebarList(true);
            triggerAutosave();
        }
    });
}

/**
 * Khởi tạo kéo thả SortableJS cho danh sách gạch đầu dòng (subbullets) của mỗi hạng mục
 */
function initSubbulletsSortable() {
    const lists = document.querySelectorAll(".vmax-quote-subbullets-list");
    lists.forEach((list) => {
        if (list.sortableInstance) {
            list.sortableInstance.destroy();
        }
        
        list.sortableInstance = Sortable.create(list, {
            handle: ".vmax-quote-bullet-drag-handle",
            ghostClass: "vmax-quote-item-ghost",
            animation: 150,
            onEnd: () => {
                const card = list.closest(".vmax-quote-item-editor-card");
                if (!card) return;
                
                const itemIdx = parseInt(card.dataset.tempIdx);
                const item = quoteData.items[itemIdx];
                if (!item) return;
                
                // Thu thập lại mảng bullets dựa theo thứ tự DOM mới sau kéo thả
                const newBullets = [];
                const inputs = list.querySelectorAll(".vmax-quote-bullet-input");
                inputs.forEach(input => {
                    newBullets.push(input.value);
                });
                
                item.bullets = newBullets;
                
                // Cập nhật preview và vẽ lại sidebar khớp thứ tự mới
                renderItemsPreview();
                rebuildItemsSidebarList(true);
                triggerAutosave();
            }
        });
    });
}

/**
 * Đổ dữ liệu từ Object quoteData vào các ô input trong Form
 */
function fillFormFromData() {
    // Nhóm 1: Công ty
    document.getElementById("comp-name").value = quoteData.company.name || "";
    document.getElementById("comp-address").value = quoteData.company.address || "";
    document.getElementById("comp-tax-id").value = quoteData.company.taxId || "";
    document.getElementById("comp-hotline").value = quoteData.company.hotline || "";
    document.getElementById("comp-email").value = quoteData.company.email || "";
    document.getElementById("comp-website").value = quoteData.company.website || "";
    
    // Nhóm 2: Báo giá
    document.getElementById("quote-title").value = quoteData.quotation.title || "";
    document.getElementById("quote-desc").value = quoteData.quotation.desc || "";
    document.getElementById("quote-code").value = quoteData.quotation.code || "";
    document.getElementById("quote-staff").value = quoteData.quotation.staff || "";
    document.getElementById("quote-date").value = quoteData.quotation.date || "";
    document.getElementById("quote-due-date").value = quoteData.quotation.dueDate || "";
    
    // Nhóm 3: Khách hàng
    document.getElementById("cust-name").value = quoteData.customer.name || "";
    document.getElementById("cust-contact").value = quoteData.customer.contactName || "";
    document.getElementById("cust-phone").value = quoteData.customer.phone || "";
    document.getElementById("cust-email").value = quoteData.customer.email || "";
    document.getElementById("cust-address").value = quoteData.customer.address || "";
    document.getElementById("cust-service").value = quoteData.customer.serviceName || "";
    document.getElementById("cust-project").value = quoteData.customer.projectName || "";
    
    // Nhóm 5: Giá trị báo giá
    document.getElementById("price-service").value = quoteData.pricing.servicePrice || 0;
    document.getElementById("price-currency").value = quoteData.pricing.currency || "VNĐ";
    
    document.getElementById("price-vat-enabled").checked = quoteData.pricing.vatEnabled;
    document.getElementById("price-vat-percent").value = quoteData.pricing.vatPercent || 0;
    document.getElementById("vat-percent-container").style.display = quoteData.pricing.vatEnabled ? "flex" : "none";
    
    document.getElementById("price-discount-enabled").checked = quoteData.pricing.discountEnabled;
    document.getElementById("price-discount-percent").value = quoteData.pricing.discountPercent || 0;
    document.getElementById("discount-percent-container").style.display = quoteData.pricing.discountEnabled ? "flex" : "none";
    
    document.getElementById("price-extra-enabled").checked = quoteData.pricing.extraEnabled;
    document.getElementById("price-extra-fee").value = quoteData.pricing.extraFee || 0;
    document.getElementById("extra-fee-container").style.display = quoteData.pricing.extraEnabled ? "flex" : "none";
    
    document.getElementById("price-word-value").value = quoteData.pricing.wordValue || "";
    
    // Nhóm 6: Giao hàng & ghi chú
    document.getElementById("time-duration").value = quoteData.timeline.duration || "";
    document.getElementById("time-start").value = quoteData.timeline.startDate || "";
    document.getElementById("time-end").value = quoteData.timeline.endDate || "";
    document.getElementById("time-notes").value = quoteData.timeline.notes || "";
    document.getElementById("time-payment").value = quoteData.timeline.paymentTerms || "";
    document.getElementById("time-warranty").value = quoteData.timeline.warranty || "";
    document.getElementById("time-signature-enabled").checked = quoteData.timeline.signatureEnabled;

    // Hiển thị xem trước ảnh chữ ký đại diện Khách hàng
    const sigCustName = document.getElementById("signature-cust-img-name");
    const sigCustPreviewImg = document.getElementById("vmax-quote-signature-cust-preview-img");
    
    if (quoteData.timeline && quoteData.timeline.signatureCustImgUrl) {
        if (sigCustPreviewImg) {
            sigCustPreviewImg.src = quoteData.timeline.signatureCustImgUrl;
            sigCustPreviewImg.style.display = "block";
        }
        if (sigCustName) {
            sigCustName.textContent = quoteData.timeline.signatureCustFileName || "Chữ ký KH đã tải.png";
        }
    } else {
        if (sigCustPreviewImg) {
            sigCustPreviewImg.src = "";
            sigCustPreviewImg.style.display = "none";
        }
        if (sigCustName) {
            sigCustName.textContent = "Chưa có tệp nào được chọn";
        }
    }

    // Hiển thị xem trước ảnh chữ ký đại diện VMAX
    const sigCompName = document.getElementById("signature-comp-img-name");
    const sigCompPreviewImg = document.getElementById("vmax-quote-signature-comp-preview-img");
    
    if (quoteData.timeline && quoteData.timeline.signatureCompImgUrl) {
        if (sigCompPreviewImg) {
            sigCompPreviewImg.src = quoteData.timeline.signatureCompImgUrl;
            sigCompPreviewImg.style.display = "block";
        }
        if (sigCompName) {
            sigCompName.textContent = quoteData.timeline.signatureCompFileName || "Chữ ký VMAX đã tải.png";
        }
    } else {
        if (sigCompPreviewImg) {
            sigCompPreviewImg.src = "";
            sigCompPreviewImg.style.display = "none";
        }
        if (sigCompName) {
            sigCompName.textContent = "Chưa có tệp nào được chọn";
        }
    }

    // Logo image preview
    if (quoteData.company.logoUrl) {
        document.getElementById("vmax-quote-page-logo-preview").src = quoteData.company.logoUrl;
        document.getElementById("vmax-quote-header-logo-img").src = quoteData.company.logoUrl;
        if (quoteData.company.logoUrl !== "assets/logo-vmax.png" && !quoteData.company.logoUrl.startsWith("assets")) {
            document.getElementById("comp-logo-name").textContent = "Ảnh tự chọn.png";
        } else {
            document.getElementById("comp-logo-name").textContent = "Logo mặc định";
        }
    }

    // Tái cấu trúc danh sách dòng khách hàng
    rebuildCustomerRowsList(true);

    // Tái cấu trúc danh sách hạng mục sidebar
    rebuildItemsSidebarList(true);
}

/**
 * Đọc dữ liệu từ form và cập nhật vào State `quoteData`
 */
function updateQuoteData(options = { renderPreview: true }) {
    // Nhóm 1: Công ty
    quoteData.company.name = document.getElementById("comp-name").value;
    quoteData.company.address = document.getElementById("comp-address").value;
    quoteData.company.taxId = document.getElementById("comp-tax-id").value;
    quoteData.company.hotline = document.getElementById("comp-hotline").value;
    quoteData.company.email = document.getElementById("comp-email").value;
    quoteData.company.website = document.getElementById("comp-website").value;

    // Nhóm 2: Báo giá
    quoteData.quotation.title = document.getElementById("quote-title").value;
    quoteData.quotation.desc = document.getElementById("quote-desc").value;
    quoteData.quotation.code = document.getElementById("quote-code").value;
    quoteData.quotation.staff = document.getElementById("quote-staff").value;
    quoteData.quotation.date = document.getElementById("quote-date").value;
    quoteData.quotation.dueDate = document.getElementById("quote-due-date").value;

    // Nhóm 3: Khách hàng
    quoteData.customer.name = document.getElementById("cust-name").value;
    quoteData.customer.contactName = document.getElementById("cust-contact").value;
    quoteData.customer.phone = document.getElementById("cust-phone").value;
    quoteData.customer.email = document.getElementById("cust-email").value;
    quoteData.customer.address = document.getElementById("cust-address").value;
    quoteData.customer.serviceName = document.getElementById("cust-service").value;
    quoteData.customer.projectName = document.getElementById("cust-project").value;

    // Nhóm 5: Giá trị báo giá
    quoteData.pricing.servicePrice = parseFloat(document.getElementById("price-service").value) || 0;
    quoteData.pricing.currency = document.getElementById("price-currency").value;
    quoteData.pricing.vatEnabled = document.getElementById("price-vat-enabled").checked;
    quoteData.pricing.vatPercent = parseFloat(document.getElementById("price-vat-percent").value) || 0;
    quoteData.pricing.discountEnabled = document.getElementById("price-discount-enabled").checked;
    quoteData.pricing.discountPercent = parseFloat(document.getElementById("price-discount-percent").value) || 0;
    quoteData.pricing.extraEnabled = document.getElementById("price-extra-enabled").checked;
    quoteData.pricing.extraFee = parseFloat(document.getElementById("price-extra-fee").value) || 0;
    quoteData.pricing.wordValue = document.getElementById("price-word-value").value;

    // Nhóm 6: Giao hàng & Ghi chú
    quoteData.timeline.duration = document.getElementById("time-duration").value;
    quoteData.timeline.startDate = document.getElementById("time-start").value;
    quoteData.timeline.endDate = document.getElementById("time-end").value;
    quoteData.timeline.notes = document.getElementById("time-notes").value;
    quoteData.timeline.paymentTerms = document.getElementById("time-payment").value;
    quoteData.timeline.warranty = document.getElementById("time-warranty").value;
    quoteData.timeline.signatureEnabled = document.getElementById("time-signature-enabled").checked;

    // Đọc danh sách hạng mục hiện thời từ các input trong DOM của sidebar
    const itemsContainer = document.getElementById("vmax-quote-items-list");
    const cards = document.querySelectorAll(".vmax-quote-item-editor-card");
    
    // Chỉ cập nhật quoteData.items nếu sidebar DOM tồn tại và (có cards hoặc người dùng chủ động xóa hết)
    if (itemsContainer && (cards.length > 0 || quoteData._userClearedItems)) {
        const listItems = [];
        cards.forEach(card => {
            const itemIdx = parseInt(card.dataset.tempIdx);
            const titleInput = card.querySelector(".vmax-quote-item-card-input-title");
            const titleVal = titleInput ? titleInput.value : "";
            
            // Đọc các bullet points
            const bulletInputs = card.querySelectorAll(".vmax-quote-bullet-input");
            const bullets = [];
            bulletInputs.forEach(bInput => {
                bullets.push(bInput.value);
            });

            const originalItem = (quoteData.items && quoteData.items[itemIdx]) || {};
            const cells = originalItem.cells || {
                "col-title": titleVal,
                "col-desc": originalItem.description || "",
                "col-price": ""
            };
            cells["col-title"] = titleVal;

            listItems.push({
                title: titleVal,
                description: originalItem.description || "",
                bullets: bullets,
                cells: cells
            });
        });
        quoteData.items = listItems;
    }

    // Tính toán lại giá trị
    calculatePricing();

    const activeEl = document.activeElement;
    const printContainer = document.getElementById("vmax-quote-page-print");
    const isEditingPreview = activeEl && printContainer && printContainer.contains(activeEl) && (
        activeEl.isContentEditable || 
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA"
    );

    // Không render lại Preview khi người dùng đang nhập trên Preview hoặc đang gõ tiếng Việt (IME)
    if (options.renderPreview !== false && !isEditingPreview && !isComposing) {
        renderPreview();
    }
}

/**
 * Xây dựng lại danh sách hạng mục ở sidebar (Form)
 * @param {boolean} fullRebuild - Nếu true, dựng lại hoàn toàn. Nếu false, chỉ cập nhật liên kết.
 */
function rebuildItemsSidebarList(fullRebuild = true) {
    const listContainer = document.getElementById("vmax-quote-items-list");
    
    if (fullRebuild) {
        listContainer.innerHTML = "";
    }

    quoteData.items.forEach((item, index) => {
        if (fullRebuild) {
            const card = document.createElement("div");
            card.className = "vmax-quote-item-editor-card";
            card.dataset.tempIdx = index;
            
            // Header card
            const header = document.createElement("div");
            header.className = "vmax-quote-item-card-header";
            
            const titleGroup = document.createElement("div");
            titleGroup.className = "vmax-quote-item-card-title-group";
            
            const dragHandle = document.createElement("span");
            dragHandle.className = "vmax-quote-item-drag-handle";
            dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';
            
            const badge = document.createElement("span");
            badge.className = "vmax-quote-item-card-index";
            badge.textContent = index + 1;
            
            const input = document.createElement("input");
            input.type = "text";
            input.className = "vmax-quote-input vmax-quote-item-card-input-title";
            input.value = item.title;
            input.placeholder = "Tên hạng mục công việc...";
            input.dataset.itemIdx = index;
            
            titleGroup.appendChild(dragHandle);
            titleGroup.appendChild(badge);
            titleGroup.appendChild(input);
            
            const actions = document.createElement("div");
            actions.className = "vmax-quote-item-card-actions";
            
            const btnClone = document.createElement("button");
            btnClone.type = "button";
            btnClone.className = "vmax-quote-btn-icon-secondary vmax-quote-btn-clone-item";
            btnClone.title = "Sao chép hạng mục";
            btnClone.innerHTML = '<i class="fas fa-copy"></i>';
            btnClone.dataset.itemIdx = index;
            btnClone.addEventListener("click", () => cloneItem(index));
            
            const btnDelete = document.createElement("button");
            btnDelete.type = "button";
            btnDelete.className = "vmax-quote-btn-icon-danger vmax-quote-btn-delete-item";
            btnDelete.title = "Xóa hạng mục";
            btnDelete.innerHTML = '<i class="fas fa-trash-alt"></i>';
            btnDelete.dataset.itemIdx = index;
            btnDelete.addEventListener("click", () => deleteItem(index));
            
            actions.appendChild(btnClone);
            actions.appendChild(btnDelete);
            
            header.appendChild(titleGroup);
            header.appendChild(actions);
            card.appendChild(header);

            // Bổ sung ô nhập mô tả ngắn (description) cho từng hạng mục
            const descGroup = document.createElement("div");
            descGroup.className = "vmax-quote-form-group";
            descGroup.style.marginTop = "6px";
            descGroup.style.marginBottom = "8px";
            
            const descLabel = document.createElement("label");
            descLabel.textContent = "Mô tả ngắn";
            descLabel.style.fontSize = "10px";
            descLabel.style.marginBottom = "2px";
            descLabel.style.color = "var(--vmax-text-muted)";
            
            const descInput = document.createElement("textarea");
            descInput.className = "vmax-quote-textarea";
            descInput.rows = "1";
            descInput.style.padding = "4px 8px";
            descInput.style.fontSize = "11px";
            descInput.value = item.description || "";
            descInput.placeholder = "Mô tả chi tiết hạng mục...";
            descInput.addEventListener("input", (e) => {
                item.description = e.target.value;
                if (!item.cells) item.cells = {};
                item.cells["col-desc"] = e.target.value;
                renderItemsPreview();
                triggerAutosave();
            });
            
            descGroup.appendChild(descLabel);
            descGroup.appendChild(descInput);
            card.appendChild(descGroup);

            // Gắn sự kiện thay đổi title chính để đồng bộ ngay
            input.addEventListener("input", (e) => {
                item.title = e.target.value;
                if (!item.cells) item.cells = {};
                item.cells["col-title"] = e.target.value;
                renderItemsPreview();
                triggerAutosave();
            });

            // Sub bullets section (Bố cục dòng gạch đầu dòng)
            const bulletsSection = document.createElement("div");
            bulletsSection.className = "vmax-quote-subbullets-builder";
            
            const bulletsHeader = document.createElement("div");
            bulletsHeader.className = "vmax-quote-subbullets-title";
            bulletsHeader.innerHTML = `
                <span>Nội dung chi tiết (Bullet points)</span>
                <button type="button" class="vmax-quote-btn-small vmax-quote-btn-add-bullet" data-item-idx="${index}">
                    <i class="fas fa-plus"></i> Thêm dòng
                </button>
            `;
                
                bulletsSection.appendChild(bulletsHeader);
                
                const bulletsList = document.createElement("div");
                bulletsList.className = "vmax-quote-subbullets-list";
                
                item.bullets.forEach((bullet, bulletIdx) => {
                    const bulletRow = document.createElement("div");
                    bulletRow.className = "vmax-quote-bullet-row";
                    
                    const dragHandle = document.createElement("span");
                    dragHandle.className = "vmax-quote-bullet-drag-handle";
                    dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
                    
                    const dot = document.createElement("span");
                    dot.className = "vmax-quote-bullet-marker";
                    dot.innerHTML = '<i class="fas fa-circle"></i>';
                    
                    const bulletInput = document.createElement("input");
                    bulletInput.type = "text";
                    bulletInput.className = "vmax-quote-bullet-input";
                    bulletInput.value = bullet;
                    bulletInput.placeholder = "Chi tiết công việc...";
                    bulletInput.dataset.itemIdx = index;
                    bulletInput.dataset.bulletIdx = bulletIdx;
                    bulletInput.addEventListener("input", (e) => {
                        item.bullets[bulletIdx] = e.target.value;
                        renderItemsPreview();
                        triggerAutosave();
                    });
                    
                    const btnDeleteBullet = document.createElement("button");
                    btnDeleteBullet.type = "button";
                    btnDeleteBullet.className = "vmax-quote-btn-icon-danger";
                    btnDeleteBullet.innerHTML = '<i class="fas fa-times"></i>';
                    btnDeleteBullet.addEventListener("click", () => {
                        deleteBullet(index, bulletIdx);
                    });
                    
                    bulletRow.appendChild(dragHandle);
                    bulletRow.appendChild(dot);
                    bulletRow.appendChild(bulletInput);
                    bulletRow.appendChild(btnDeleteBullet);
                    bulletsList.appendChild(bulletRow);
                });
                
                bulletsSection.appendChild(bulletsList);
                card.appendChild(bulletsSection);
                listContainer.appendChild(card);
                
                // Gắn sự kiện thêm bullet
                bulletsHeader.querySelector(".vmax-quote-btn-add-bullet").addEventListener("click", () => {
                    addBulletToItem(index);
                });
            } else {
            // Nếu không rebuilt, chỉ cần cập nhật dataset tempIdx để khớp sau kéo thả
            const card = listContainer.children[index];
            if (card) {
                card.dataset.tempIdx = index;
                // Cập nhật chỉ số badge hiển thị
                const badge = card.querySelector(".vmax-quote-item-card-index");
                if (badge) badge.textContent = index + 1;
            }
        }
    });

    if (fullRebuild) {
        initSortable();
        initSubbulletsSortable();
    }
}

/**
 * Thêm hạng mục mới
 */
function addNewItem() {
    if (!quoteData.items) quoteData.items = [];
    quoteData.items.push({
        title: `Hạng mục mới ${quoteData.items.length + 1}`,
        description: "",
        bullets: []
    });
    quoteData._userClearedItems = false;
    quoteData._initialized = true;
    rebuildItemsSidebarList(true);
    updateQuoteData();
    triggerAutosave();
    
    // Tự động cuộn đến hạng mục vừa thêm ở sidebar
    const list = document.getElementById("vmax-quote-items-list");
    if (list && list.lastElementChild) {
        setTimeout(() => {
            list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

/**
 * Nhân bản hạng mục công việc
 */
function cloneItem(index) {
    const itemToClone = JSON.parse(JSON.stringify(quoteData.items[index]));
    itemToClone.title += " (Bản sao)";
    quoteData.items.splice(index + 1, 0, itemToClone);
    
    rebuildItemsSidebarList(true);
    updateQuoteData();
    triggerAutosave();
    showToast("Đã nhân bản hạng mục thành công!");
    
    // Tự động cuộn đến hạng mục vừa nhân bản ở sidebar
    const list = document.getElementById("vmax-quote-items-list");
    if (list) {
        const targetCard = list.children[index + 1];
        if (targetCard) {
            setTimeout(() => {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }
}

/**
 * Xóa hạng mục công việc
 */
async function deleteItem(index) {
    if (quoteData.items.length <= 1) {
        showToast("Bạn cần giữ lại ít nhất một hạng mục công việc!", "warning");
        return;
    }

    const confirmDelete = await showConfirmModal(
        "Xác nhận xóa hạng mục",
        `Bạn có chắc chắn muốn xóa hạng mục số ${index + 1} "${quoteData.items[index].title || 'Chưa đặt tên'}" không?`
    );
    
    if (confirmDelete) {
        const deletedItem = quoteData.items[index];
        const backupItems = JSON.parse(JSON.stringify(quoteData.items));
        
        quoteData.items.splice(index, 1);
        if (quoteData.items.length === 0) {
            quoteData._userClearedItems = true;
        }
        rebuildItemsSidebarList(true);
        updateQuoteData();
        triggerAutosave();
        
        showUndoToast(`Đã xóa hạng mục "${deletedItem.title || 'Chưa đặt tên'}"`, () => {
            quoteData.items = backupItems;
            if (quoteData.items.length > 0) {
                quoteData._userClearedItems = false;
            }
            rebuildItemsSidebarList(true);
            updateQuoteData();
            triggerAutosave();
            showToast("Đã khôi phục hạng mục thành công!");
        });
    }
}

/**
 * Thêm một bullet point vào một hạng mục
 */
function addBulletToItem(itemIndex) {
    quoteData.items[itemIndex].bullets.push("");
    rebuildItemsSidebarList(true);
    updateQuoteData();
    triggerAutosave();
}

/**
 * Xóa một bullet point
 */
function deleteBullet(itemIndex, bulletIndex) {
    quoteData.items[itemIndex].bullets.splice(bulletIndex, 1);
    rebuildItemsSidebarList(true);
    updateQuoteData();
    triggerAutosave();
}


// --- XỬ LÝ TÍNH TOÁN GIÁ TIỀN & ĐỊNH DẠNG ---

/**
 * Thực hiện tính toán các khoản chi phí của báo giá
 */
function calculatePricing() {
    const basePrice = quoteData.pricing.servicePrice || 0;
    
    // 1. Chiết khấu
    let discountAmount = 0;
    if (quoteData.pricing.discountEnabled) {
        discountAmount = basePrice * ((quoteData.pricing.discountPercent || 0) / 100);
    }
    
    // Giá trị sau chiết khấu
    const priceAfterDiscount = Math.max(0, basePrice - discountAmount);

    // 2. Thuế VAT (Tính trên giá trị sau chiết khấu)
    let vatAmount = 0;
    if (quoteData.pricing.vatEnabled) {
        vatAmount = priceAfterDiscount * ((quoteData.pricing.vatPercent || 0) / 100);
    }
    
    // 3. Chi phí phát sinh
    let extraAmount = 0;
    if (quoteData.pricing.extraEnabled) {
        extraAmount = quoteData.pricing.extraFee || 0;
    }
    
    // 4. Tổng thanh toán
    const totalAmount = priceAfterDiscount + vatAmount + extraAmount;
    
    // Định dạng đơn vị tiền tệ
    const currency = quoteData.pricing.currency || "VNĐ";

    // Gán kết quả vào State
    quoteData.pricing.calculatedVat = vatAmount;
    quoteData.pricing.calculatedDiscount = discountAmount;
    quoteData.pricing.calculatedTotal = totalAmount;

    // Cập nhật số tiền bằng chữ (Tự động theo thời gian thực)
    const textWords = convertNumberToVietnameseWords(totalAmount, currency);
    document.getElementById("price-word-value").value = textWords;
    quoteData.pricing.wordValue = textWords;

    // Hiển thị live calculator ở sidebar
    document.getElementById("live-calc-service").textContent = formatCurrency(basePrice, currency);
    
    const vatRow = document.getElementById("live-calc-vat-row");
    if (quoteData.pricing.vatEnabled) {
        vatRow.style.display = "flex";
        document.getElementById("live-vat-rate").textContent = quoteData.pricing.vatPercent || 0;
        document.getElementById("live-calc-vat").textContent = formatCurrency(vatAmount, currency);
    } else {
        vatRow.style.display = "none";
    }

    const discountRow = document.getElementById("live-calc-discount-row");
    if (quoteData.pricing.discountEnabled) {
        discountRow.style.display = "flex";
        document.getElementById("live-discount-rate").textContent = quoteData.pricing.discountPercent || 0;
        document.getElementById("live-calc-discount").textContent = "-" + formatCurrency(discountAmount, currency);
    } else {
        discountRow.style.display = "none";
    }

    const extraRow = document.getElementById("live-calc-extra-row");
    if (quoteData.pricing.extraEnabled) {
        extraRow.style.display = "flex";
        document.getElementById("live-calc-extra").textContent = formatCurrency(extraAmount, currency);
    } else {
        extraRow.style.display = "none";
    }

    document.getElementById("live-calc-total").textContent = formatCurrency(totalAmount, currency);
}

/**
 * Định dạng số thành tiền tệ
 */
function formatCurrency(amount, currency = "VNĐ") {
    if (currency === "VNĐ") {
        return amount.toLocaleString("vi-VN") + " VNĐ";
    } else {
        return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
    }
}

/**
 * Chuyển đổi số thành chữ (VNĐ / USD)
 */
function convertNumberToVietnameseWords(num, currency = "VNĐ") {
    if (num === 0) return currency === "USD" ? "Không Đô la Mỹ" : "Không đồng";
    let str = "";
    
    // Đọc số nguyên dương
    let intNum = Math.floor(Math.abs(num));
    
    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    
    function readThreeDigits(n, showZeroHundred) {
        let hundred = Math.floor(n / 100);
        let ten = Math.floor((n % 100) / 10);
        let unit = n % 10;
        let res = "";
        
        if (hundred > 0 || showZeroHundred) {
            if (hundred === 0) {
                res += "không trăm ";
            } else {
                res += units[hundred] + " trăm ";
            }
        }
        
        if (ten > 0) {
            if (ten === 1) {
                res += "mười ";
            } else {
                res += units[ten] + " mươi ";
            }
        } else if (hundred > 0 && unit > 0) {
            res += "lẻ ";
        }
        
        if (unit > 0) {
            if (unit === 1 && ten > 1) {
                res += "mốt ";
            } else if (unit === 5 && ten > 0) {
                res += "lăm ";
            } else {
                res += units[unit] + " ";
            }
        }
        
        return res;
    }
    
    let groups = [];
    let tempNum = intNum;
    while (tempNum > 0) {
        groups.push(tempNum % 1000);
        tempNum = Math.floor(tempNum / 1000);
    }
    
    const groupNames = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
    
    for (let i = groups.length - 1; i >= 0; i--) {
        let g = groups[i];
        if (g === 0) continue;
        
        let showZero = (i < groups.length - 1);
        let gStr = readThreeDigits(g, showZero);
        
        str += gStr + groupNames[i] + " ";
    }
    
    str = str.trim();
    if (!str) return currency === "USD" ? "Không Đô la Mỹ" : "Không đồng";
    
    str = str.charAt(0).toUpperCase() + str.slice(1);
    str = str.replace(/\s+/g, " ");
    
    if (currency === "USD") {
        return str + " Đô la Mỹ";
    } else {
        return str + " đồng";
    }
}


// --- XỬ LÝ RENDER BẢN XEM TRƯỚC (PREVIEW) ---

/**
 * Hiển thị dữ liệu lên bản xem trước A4
 */
function renderPreview() {
    const previewArea = document.getElementById("vmax-quote-page-print");
    const activeEl = document.activeElement;
    const isEditingPreview = activeEl && previewArea && previewArea.contains(activeEl) && (
        activeEl.isContentEditable || 
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA"
    );

    // Nếu người dùng đang nhập trực tiếp trên Preview hoặc đang trong phiên IME tiếng Việt, bỏ qua render lại DOM
    if (isEditingPreview || isComposing) {
        return;
    }

    const savedSelectionState = previewArea ? saveSelection(previewArea) : null;
    // 1. Nhóm 1: Công ty
    document.getElementById("p-comp-name").textContent = quoteData.company.name || "CÔNG TY VMAX";
    document.getElementById("p-comp-address").textContent = "Địa chỉ: " + (quoteData.company.address || "");
    
    const taxWrap = document.getElementById("p-comp-tax-wrap");
    if (quoteData.company.taxId) {
        taxWrap.style.display = "inline";
        document.getElementById("p-comp-tax").textContent = quoteData.company.taxId;
    } else {
        taxWrap.style.display = "none";
    }
    document.getElementById("p-comp-hotline").textContent = quoteData.company.hotline || "";
    document.getElementById("p-comp-email").textContent = quoteData.company.email || "";
    document.getElementById("p-comp-website").textContent = quoteData.company.website || "";

    // Logo
    const pageLogo = document.getElementById("vmax-quote-page-logo-preview");
    if (quoteData.company.logoUrl) {
        pageLogo.src = quoteData.company.logoUrl;
        pageLogo.style.display = "block";
    } else {
        pageLogo.style.display = "none";
    }

    // 2. Nhóm 2: Báo giá
    document.getElementById("p-quote-title").textContent = quoteData.quotation.title || "BẢNG BÁO GIÁ DỊCH VỤ";
    document.getElementById("p-quote-desc").textContent = quoteData.quotation.desc || "";
    document.getElementById("p-quote-code").textContent = quoteData.quotation.code || "--";
    document.getElementById("p-quote-date").textContent = formatDateToVietnamese(quoteData.quotation.date);
    document.getElementById("p-quote-due-date").textContent = formatDateToVietnamese(quoteData.quotation.dueDate);
    document.getElementById("p-quote-staff").textContent = quoteData.quotation.staff || "--";

    // 3. Nhóm 3: Khách hàng (Động)
    renderCustomerRowsPreview();
    document.getElementById("p-cust-project").textContent = quoteData.customer.projectName || "";

    // 4. Nhóm 4: Render Hạng mục công việc
    renderItemsPreview();

    // 5. Nhóm 5: Giá tiền bảng chi tiết
    const curr = quoteData.pricing.currency;
    document.getElementById("p-price-service").textContent = formatCurrency(quoteData.pricing.servicePrice, curr);
    
    // VAT
    const pVatRow = document.getElementById("p-price-vat-row");
    if (quoteData.pricing.vatEnabled) {
        pVatRow.style.display = "table-row";
        document.getElementById("p-vat-rate").textContent = quoteData.pricing.vatPercent;
        document.getElementById("p-price-vat").textContent = formatCurrency(quoteData.pricing.calculatedVat, curr);
    } else {
        pVatRow.style.display = "none";
    }
    
    // Chiết khấu
    const pDiscountRow = document.getElementById("p-price-discount-row");
    if (quoteData.pricing.discountEnabled) {
        pDiscountRow.style.display = "table-row";
        document.getElementById("p-discount-rate").textContent = quoteData.pricing.discountPercent;
        document.getElementById("p-price-discount").textContent = "-" + formatCurrency(quoteData.pricing.calculatedDiscount, curr);
    } else {
        pDiscountRow.style.display = "none";
    }

    // Chi phí phát sinh khác
    const pExtraRow = document.getElementById("p-price-extra-row");
    if (quoteData.pricing.extraEnabled) {
        pExtraRow.style.display = "table-row";
        document.getElementById("p-price-extra").textContent = formatCurrency(quoteData.pricing.extraFee, curr);
    } else {
        pExtraRow.style.display = "none";
    }

    // Tổng tiền thanh toán
    document.getElementById("p-price-total").textContent = formatCurrency(quoteData.pricing.calculatedTotal, curr);
    document.getElementById("p-price-words").textContent = quoteData.pricing.wordValue ? (quoteData.pricing.wordValue + ".") : "";

    // 6. Nhóm 6: Tiến độ & Ghi chú
    document.getElementById("p-time-duration").textContent = quoteData.timeline.duration || "--";
    
    const datesWrap = document.getElementById("p-time-dates-wrap");
    if (quoteData.timeline.startDate || quoteData.timeline.endDate) {
        datesWrap.style.display = "block";
        document.getElementById("p-time-start").textContent = formatDateToVietnamese(quoteData.timeline.startDate);
        document.getElementById("p-time-end").textContent = formatDateToVietnamese(quoteData.timeline.endDate);
    } else {
        datesWrap.style.display = "none";
    }

    // Bảo hành
    const warrantyBox = document.getElementById("p-warranty-box-wrap");
    if (quoteData.timeline.warranty) {
        warrantyBox.style.display = "block";
        document.getElementById("p-time-warranty").textContent = quoteData.timeline.warranty;
    } else {
        warrantyBox.style.display = "none";
    }

    // Điều khoản thanh toán
    const paymentBox = document.getElementById("p-payment-box-wrap");
    if (quoteData.timeline.paymentTerms) {
        paymentBox.style.display = "block";
        document.getElementById("p-time-payment").textContent = quoteData.timeline.paymentTerms;
    } else {
        paymentBox.style.display = "none";
    }

    // Ghi chú
    const notesBox = document.getElementById("p-notes-box-wrap");
    if (quoteData.timeline.notes) {
        notesBox.style.display = "block";
        document.getElementById("p-time-notes").textContent = quoteData.timeline.notes;
    } else {
        notesBox.style.display = "none";
    }

    // Ký tên & Ảnh chữ ký trên Preview A4
    const sigPanel = document.getElementById("vmax-quote-signatures-panel");
    if (sigPanel) {
        sigPanel.style.display = (quoteData.timeline && quoteData.timeline.signatureEnabled) ? "flex" : "none";
    }

    const sigCustPreviewImg = document.getElementById("vmax-quote-signature-cust-preview-img");
    if (sigCustPreviewImg) {
        if (quoteData.timeline && quoteData.timeline.signatureCustImgUrl) {
            sigCustPreviewImg.src = quoteData.timeline.signatureCustImgUrl;
            sigCustPreviewImg.style.display = "block";
        } else {
            sigCustPreviewImg.src = "";
            sigCustPreviewImg.style.display = "none";
        }
    }

    const sigCompPreviewImg = document.getElementById("vmax-quote-signature-comp-preview-img");
    if (sigCompPreviewImg) {
        if (quoteData.timeline && quoteData.timeline.signatureCompImgUrl) {
            sigCompPreviewImg.src = quoteData.timeline.signatureCompImgUrl;
            sigCompPreviewImg.style.display = "block";
        } else {
            sigCompPreviewImg.src = "";
            sigCompPreviewImg.style.display = "none";
        }
    }

    // Ẩn/Hiện grid 2 cột điều khoản nếu cả bảo hành và tiến độ không có
    const termsGrid = document.querySelector(".vmax-quote-page-terms-grid");
    if (termsGrid) {
        if (!quoteData.timeline.warranty && !quoteData.timeline.duration && !quoteData.timeline.startDate) {
            termsGrid.style.display = "none";
        } else {
            termsGrid.style.display = "grid";
        }
    }

    if (savedSelectionState && previewArea) {
        restoreSelection(savedSelectionState, previewArea);
    }
}

/**
 * Render riêng danh sách hạng mục trong bản A4
 */
function renderItemsPreview() {
    const previewContainer = document.getElementById("vmax-quote-page-items-preview");
    previewContainer.innerHTML = "";
    
    if (quoteData.items.length === 0) {
        previewContainer.innerHTML = '<p class="vmax-quote-info-text">Chưa có hạng mục công việc nào.</p>';
        return;
    }


    quoteData.items.forEach((item, index) => {
        const itemRow = document.createElement("div");
        itemRow.className = "vmax-quote-page-item-row";
        
        const header = document.createElement("div");
        header.className = "vmax-quote-page-item-header";
        
        const num = document.createElement("span");
        num.className = "vmax-quote-page-item-num";
        num.textContent = index + 1;
        
        const title = document.createElement("span");
        title.className = "vmax-quote-page-item-title vmax-quote-page-editable-item-title";
        title.textContent = item.title;
        title.dataset.itemIdx = index;
        
        header.appendChild(num);
        header.appendChild(title);
        itemRow.appendChild(header);

        // Omit description rendering to match the image layout

        if (item.bullets && item.bullets.length > 0) {
            const list = document.createElement("ul");
            list.className = "vmax-quote-page-item-bullets";
            
            item.bullets.forEach((bullet, bulletIdx) => {
                if (bullet.trim() !== "") {
                    const li = document.createElement("li");
                    li.className = "vmax-quote-page-editable-bullet";
                    li.textContent = bullet;
                    li.dataset.itemIdx = index;
                    li.dataset.bulletIdx = bulletIdx;
                    list.appendChild(li);
                }
            });
            
            itemRow.appendChild(list);
        }

        // Render custom devices display for Responsive Website item
        if (item.title && item.title.toLowerCase().includes("responsive")) {
            const devicesDiv = document.createElement("div");
            devicesDiv.className = "vmax-quote-devices-container";
            devicesDiv.innerHTML = `
                <div class="vmax-quote-device-item">
                    <i class="fas fa-desktop"></i>
                    <div>
                        <span class="vmax-quote-device-label">Máy tính</span>
                        <span class="vmax-quote-device-sub">(Desktop)</span>
                    </div>
                </div>
                <div class="vmax-quote-device-divider"></div>
                <div class="vmax-quote-device-item">
                    <i class="fas fa-tablet-alt"></i>
                    <div>
                        <span class="vmax-quote-device-label">Máy tính bảng</span>
                        <span class="vmax-quote-device-sub">(Tablet)</span>
                    </div>
                </div>
                <div class="vmax-quote-device-divider"></div>
                <div class="vmax-quote-device-item">
                    <i class="fas fa-mobile-alt"></i>
                    <div>
                        <span class="vmax-quote-device-label">Điện thoại</span>
                        <span class="vmax-quote-device-sub">(Mobile)</span>
                    </div>
                </div>
            `;
            itemRow.appendChild(devicesDiv);
        }

        previewContainer.appendChild(itemRow);
    });

    // Cập nhật trạng thái Contenteditable sau khi vẽ lại hạng mục
    const isDirectEdit = document.getElementById("vmax-quote-page-print").classList.contains("vmax-quote-editable-active");
    setPreviewEditableState(isDirectEdit);
}

/**
 * Chuyển đổi định dạng ngày sang VN
 */
function formatDateToVietnamese(dateStr) {
    if (!dateStr) return "--";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}


// --- CHẾ ĐỘ CHỈNH SỬA TRỰC TIẾP TRÊN BẢN XEM TRƯỚC ---

// handleDirectEditToggle đã được loại bỏ vì tính năng chỉnh sửa trực tiếp hoạt động mặc định

/**
 * Gán contenteditable cho các phần tử trên A4
 */
function setPreviewEditableState(isActive) {
    const page = document.getElementById("vmax-quote-page-print");
    if (isActive) {
        page.classList.add("vmax-quote-editable-active");
    } else {
        page.classList.remove("vmax-quote-editable-active");
    }

    // Các phần tử cho phép sửa đổi text trực tiếp
    const editableSelectors = [
        "#p-comp-name", "#p-comp-address", "#p-comp-tax", "#p-comp-hotline", 
        "#p-comp-email", "#p-comp-website", "#p-quote-title", "#p-quote-desc",
        "#p-quote-code", "#p-cust-name", "#p-cust-contact", "#p-cust-phone", 
        "#p-cust-email", "#p-cust-address", "#p-cust-service", "#p-cust-project", "#p-price-words",
        "#p-time-duration", "#p-time-start", "#p-time-end", "#p-time-warranty",
        "#p-time-payment", "#p-time-notes", "#p-price-service", ".vmax-quote-page-editable-item-title",
        ".vmax-quote-page-editable-bullet"
    ];

    editableSelectors.forEach(selector => {
        const elements = page.querySelectorAll(selector);
        elements.forEach(el => {
            if (isActive) {
                el.setAttribute("contenteditable", "true");
            } else {
                el.removeAttribute("contenteditable");
            }
        });
    });
}

/**
 * Lắng nghe thay đổi khi gõ trực tiếp trên bản A4 và cập nhật ngược về form
 */
function handlePreviewDirectInput(e) {
    if (!document.getElementById("vmax-quote-page-print").classList.contains("vmax-quote-editable-active")) return;
    
    const target = e.target;
    const id = target.id;
    
    // Ánh xạ id bản xem trước về id input trong form
    const idMap = {
        "p-comp-name": "comp-name",
        "p-comp-address": "comp-address",
        "p-comp-tax": "comp-tax-id",
        "p-comp-hotline": "comp-hotline",
        "p-comp-email": "comp-email",
        "p-comp-website": "comp-website",
        "p-quote-title": "quote-title",
        "p-quote-desc": "quote-desc",
        "p-quote-code": "quote-code",
        "p-cust-name": "cust-name",
        "p-cust-contact": "cust-contact",
        "p-cust-phone": "cust-phone",
        "p-cust-email": "cust-email",
        "p-cust-address": "cust-address",
        "p-cust-service": "cust-service",
        "p-cust-project": "cust-project",
        "p-price-words": "price-word-value",
        "p-time-duration": "time-duration",
        "p-time-warranty": "time-warranty",
        "p-time-payment": "time-payment",
        "p-time-notes": "time-notes",
        "p-price-service": "price-service"
    };

    const inputId = idMap[id];
    if (inputId) {
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            if (inputId === "price-service") {
                // Trích xuất số từ chuỗi nhập trực tiếp (loại bỏ VNĐ, chấm, phẩy...)
                const rawText = target.innerText.replace(/[^0-9]/g, "");
                const numValue = parseFloat(rawText) || 0;
                inputEl.value = numValue;
                quoteData.pricing.servicePrice = numValue;
                calculatePricing();
                
                // Đồng bộ các trường phụ thuộc trên preview mà không vẽ lại toàn bộ DOM
                const curr = quoteData.pricing.currency;
                document.getElementById("p-price-vat").textContent = formatCurrency(quoteData.pricing.calculatedVat, curr);
                document.getElementById("p-price-total").textContent = formatCurrency(quoteData.pricing.calculatedTotal, curr);
                document.getElementById("p-price-words").textContent = quoteData.pricing.wordValue ? (quoteData.pricing.wordValue + ".") : "";
                
                // Đồng bộ live panel ở sidebar
                document.getElementById("live-calc-service").textContent = formatCurrency(numValue, curr);
                if (quoteData.pricing.vatEnabled) {
                    document.getElementById("live-calc-vat").textContent = formatCurrency(quoteData.pricing.calculatedVat, curr);
                }
                document.getElementById("live-calc-total").textContent = formatCurrency(quoteData.pricing.calculatedTotal, curr);
            } else {
                inputEl.value = target.innerText.trim();
            }
        }
    }
    
    // Trường hợp ngày lập và ngày hết hạn
    if (id === "p-quote-date" || id === "p-quote-due-date") {
        // Bản xem trước định dạng DD/MM/YYYY, input là YYYY-MM-DD
        const dateText = target.innerText.trim();
        const parts = dateText.split("/");
        if (parts.length === 3) {
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            const targetInputId = id === "p-quote-date" ? "quote-date" : "quote-due-date";
            document.getElementById(targetInputId).value = formattedDate;
        }
    }

    // Trường hợp ngày dự án (Tiến độ bắt đầu/kết thúc)
    if (id === "p-time-start" || id === "p-time-end") {
        const dateText = target.innerText.trim();
        const parts = dateText.split("/");
        if (parts.length === 3) {
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            const targetInputId = id === "p-time-start" ? "time-start" : "time-end";
            document.getElementById(targetInputId).value = formattedDate;
        }
    }

    // Trường hợp sửa tiêu đề hạng mục
    if (target.classList.contains("vmax-quote-page-editable-item-title")) {
        const itemIdx = parseInt(target.dataset.itemIdx);
        if (!isNaN(itemIdx) && quoteData.items[itemIdx]) {
            quoteData.items[itemIdx].title = target.innerText.trim();
            // Đồng bộ sang sidebar input tương ứng mà không vẽ lại
            const sidebarInput = document.querySelector(`.vmax-quote-item-card-input-title[data-item-idx="${itemIdx}"]`);
            if (sidebarInput) {
                sidebarInput.value = target.innerText.trim();
            }
        }
    }

    // Trường hợp sửa bullet point của hạng mục
    if (target.classList.contains("vmax-quote-page-editable-bullet")) {
        const itemIdx = parseInt(target.dataset.itemIdx);
        const bulletIdx = parseInt(target.dataset.bulletIdx);
        if (!isNaN(itemIdx) && !isNaN(bulletIdx) && quoteData.items[itemIdx]) {
            quoteData.items[itemIdx].bullets[bulletIdx] = target.innerText.trim();
            // Đồng bộ sang sidebar input tương ứng
            const sidebarInput = document.querySelector(`.vmax-quote-bullet-input[data-item-idx="${itemIdx}"][data-bullet-idx="${bulletIdx}"]`);
            if (sidebarInput) {
                sidebarInput.value = target.innerText.trim();
            }
        }
    }

    // Cập nhật State nội bộ
    // Không dùng updateQuoteData() hoàn toàn để tránh giật lag khi gõ trực tiếp
    quoteData.company.name = document.getElementById("comp-name").value;
    quoteData.company.address = document.getElementById("comp-address").value;
    quoteData.company.taxId = document.getElementById("comp-tax-id").value;
    quoteData.company.hotline = document.getElementById("comp-hotline").value;
    quoteData.company.email = document.getElementById("comp-email").value;
    quoteData.company.website = document.getElementById("comp-website").value;
    
    quoteData.quotation.title = document.getElementById("quote-title").value;
    quoteData.quotation.desc = document.getElementById("quote-desc").value;
    quoteData.quotation.code = document.getElementById("quote-code").value;
    quoteData.quotation.date = document.getElementById("quote-date").value;
    quoteData.quotation.dueDate = document.getElementById("quote-due-date").value;
    
    quoteData.customer.name = document.getElementById("cust-name").value;
    quoteData.customer.contactName = document.getElementById("cust-contact").value;
    quoteData.customer.phone = document.getElementById("cust-phone").value;
    quoteData.customer.email = document.getElementById("cust-email").value;
    quoteData.customer.address = document.getElementById("cust-address").value;
    quoteData.customer.serviceName = document.getElementById("cust-service").value;
    quoteData.customer.projectName = document.getElementById("cust-project").value;

    quoteData.timeline.duration = document.getElementById("time-duration").value;
    quoteData.timeline.startDate = document.getElementById("time-start").value;
    quoteData.timeline.endDate = document.getElementById("time-end").value;
    quoteData.timeline.warranty = document.getElementById("time-warranty").value;
    quoteData.timeline.paymentTerms = document.getElementById("time-payment").value;
    quoteData.timeline.notes = document.getElementById("time-notes").value;
    quoteData.pricing.wordValue = document.getElementById("price-word-value").value;

    triggerAutosave();
}


// --- TOAST, LOADING, ZOOM & LOGO UPLOAD HELPERS ---

/**
 * Hiển thị Toast thông báo ở góc màn hình
 */
function showToast(message, type = "success") {
    const container = document.getElementById("vmax-quote-toast-container-id");
    const toast = document.createElement("div");
    toast.className = `vmax-quote-toast vmax-quote-toast-${type}`;
    
    const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Xử lý tải ảnh logo công ty lên
 */
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.match("image.*")) {
            showToast("Vui lòng chỉ chọn tệp ảnh!", "danger");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            quoteData.company.logoUrl = evt.target.result;
            
            // Cập nhật text hiển thị tên file
            document.getElementById("comp-logo-name").textContent = file.name;
            
            // Hiển thị logo lên preview
            document.getElementById("vmax-quote-page-logo-preview").src = evt.target.result;
            document.getElementById("vmax-quote-page-logo-preview").style.display = "block";
            document.getElementById("vmax-quote-header-logo-img").src = evt.target.result;
            
            triggerAutosave();
            showToast("Đã tải logo lên thành công!");
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Xử lý tải ảnh chữ ký đại diện Khách hàng lên
 */
function handleCustSignatureUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
        if (!file.type.match("image.*")) {
            showToast("Vui lòng chỉ chọn tệp ảnh!", "danger");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            if (!quoteData.timeline) {
                quoteData.timeline = {};
            }
            quoteData.timeline.signatureCustImgUrl = evt.target.result;
            quoteData.timeline.signatureCustFileName = file.name;
            
            // Cập nhật text hiển thị tên file ở Sidebar
            const nameEl = document.getElementById("signature-cust-img-name");
            if (nameEl) nameEl.textContent = file.name;
            
            // Hiển thị chữ ký ngay lên A4 Preview
            const previewImg = document.getElementById("vmax-quote-signature-cust-preview-img");
            if (previewImg) {
                previewImg.src = evt.target.result;
                previewImg.style.display = "block";
            }
            
            triggerAutosave();
            showToast("Đã tải ảnh chữ ký Khách hàng lên thành công!");
            e.target.value = "";
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Xử lý tải ảnh chữ ký đại diện VMAX lên
 */
function handleCompSignatureUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
        if (!file.type.match("image.*")) {
            showToast("Vui lòng chỉ chọn tệp ảnh!", "danger");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            if (!quoteData.timeline) {
                quoteData.timeline = {};
            }
            quoteData.timeline.signatureCompImgUrl = evt.target.result;
            quoteData.timeline.signatureCompFileName = file.name;
            
            // Cập nhật text hiển thị tên file ở Sidebar
            const nameEl = document.getElementById("signature-comp-img-name");
            if (nameEl) nameEl.textContent = file.name;
            
            // Hiển thị chữ ký ngay lên A4 Preview
            const previewImg = document.getElementById("vmax-quote-signature-comp-preview-img");
            if (previewImg) {
                previewImg.src = evt.target.result;
                previewImg.style.display = "block";
            }
            
            triggerAutosave();
            showToast("Đã tải ảnh chữ ký VMAX lên thành công!");
            e.target.value = "";
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Điều chỉnh độ thu phóng của bản xem trước A4
 */
function adjustZoom(step) {
    currentZoom += step;
    if (currentZoom < 50) currentZoom = 50;
    if (currentZoom > 150) currentZoom = 150;
    applyZoom();
}

/**
 * Áp dụng tỉ lệ zoom CSS cho trang A4
 */
function applyZoom() {
    const page = document.getElementById("vmax-quote-page-print");
    if (page) {
        page.style.transform = `scale(${currentZoom / 100})`;
        document.getElementById("vmax-quote-zoom-val").textContent = `${currentZoom}%`;
    }
}

/**
 * Cập nhật hiển thị badge trạng thái lưu nháp trên Header
 */
function setSaveStatus(status) {
    const badge = document.getElementById("vmax-quote-save-status");
    if (!badge) return;
    if (status === "saved") {
        badge.className = "vmax-quote-save-badge saved";
        badge.innerHTML = '<i class="fas fa-check-circle"></i> Đã lưu';
    } else if (status === "unsaved") {
        badge.className = "vmax-quote-save-badge unsaved";
        badge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Chưa lưu';
    } else if (status === "saving") {
        badge.className = "vmax-quote-save-badge saving";
        badge.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    }
}

/**
 * Lưu trạng thái hiện tại vào Undo Stack
 */
function pushUndoState() {
    if (isUndoRedoOperation) return;
    try {
        const uStack = getActiveUndoStack();
        const rStack = getActiveRedoStack();
        const snapshot = JSON.stringify(quoteData);
        if (uStack.length > 0 && uStack[uStack.length - 1] === snapshot) {
            return;
        }
        uStack.push(snapshot);
        if (uStack.length > MAX_STACK_SIZE) {
            uStack.shift();
        }
        rStack.length = 0; // Reset Redo stack cho mẫu hiện tại
        updateUndoRedoUI();
    } catch (e) {
        console.error("Failed to push undo state:", e);
    }
}

/**
 * Cập nhật trạng thái bật/tắt các nút Undo & Redo trên UI
 */
function updateUndoRedoUI() {
    const undoBtn = document.getElementById("vmax-quote-btn-undo");
    const redoBtn = document.getElementById("vmax-quote-btn-redo");
    const uStack = getActiveUndoStack();
    const rStack = getActiveRedoStack();
    if (undoBtn) undoBtn.disabled = (uStack.length === 0);
    if (redoBtn) redoBtn.disabled = (rStack.length === 0);
}

/**
 * Thao tác Hoàn tác (Undo - Ctrl+Z)
 */
function undo() {
    const uStack = getActiveUndoStack();
    const rStack = getActiveRedoStack();
    if (uStack.length === 0) return;
    try {
        isUndoRedoOperation = true;
        const currentState = JSON.stringify(quoteData);
        rStack.push(currentState);
        
        const previousState = uStack.pop();
        quoteData = JSON.parse(previousState);
        
        rebuildItemsSidebarList(true);
        fillFormFromData();
        calculatePricing();
        renderPreview();
        updateUndoRedoUI();
        
        setSaveStatus("unsaved");
        triggerAutosave();
        showToast("Đã hoàn tác (Ctrl+Z)", "success");
    } catch (e) {
        console.error("Undo error:", e);
    } finally {
        isUndoRedoOperation = false;
    }
}

/**
 * Thao tác Khôi phục (Redo - Ctrl+Y)
 */
function redo() {
    const uStack = getActiveUndoStack();
    const rStack = getActiveRedoStack();
    if (rStack.length === 0) return;
    try {
        isUndoRedoOperation = true;
        const currentState = JSON.stringify(quoteData);
        uStack.push(currentState);
        
        const nextState = rStack.pop();
        quoteData = JSON.parse(nextState);
        
        rebuildItemsSidebarList(true);
        fillFormFromData();
        calculatePricing();
        renderPreview();
        updateUndoRedoUI();
        
        setSaveStatus("unsaved");
        triggerAutosave();
        showToast("Đã khôi phục (Ctrl+Y)", "success");
    } catch (e) {
        console.error("Redo error:", e);
    } finally {
        isUndoRedoOperation = false;
    }
}

/**
 * Kích hoạt vòng lặp tự động lưu nháp
 */
function triggerAutosave(delay = 1000) {
    if (isComposing) return;
    setSaveStatus("unsaved");
    if (autosaveTimer) {
        clearTimeout(autosaveTimer);
    }
    
    autosaveTimer = setTimeout(() => {
        if (isComposing) return;
        setSaveStatus("saving");
        saveDraft(false);
        setTimeout(() => setSaveStatus("saved"), 300);
    }, delay);
}


/**
 * Tải đối tượng dữ liệu mặc định ban đầu cho một mẫu báo giá cụ thể
 */
function loadDefaultTemplateData(templateId) {
    const key = templateId || "preset-web";
    const preset = PRESET_TEMPLATES[key];
    let base = preset ? JSON.parse(JSON.stringify(preset)) : JSON.parse(JSON.stringify(DEFAULT_QUOTE_DATA));
    const merged = mergeDeep({}, DEFAULT_QUOTE_DATA, base);
    merged.activeTemplate = key;
    merged._initialized = true;
    merged._userClearedItems = false;
    if (!merged.items || !Array.isArray(merged.items) || merged.items.length === 0) {
        if (preset && preset.items && preset.items.length > 0) {
            merged.items = JSON.parse(JSON.stringify(preset.items));
        } else {
            merged.items = JSON.parse(JSON.stringify(DEFAULT_QUOTE_DATA.items));
        }
    }
    return JSON.parse(JSON.stringify(merged));
}

/**
 * Lấy key lưu nháp cho mẫu báo giá cụ thể
 */
function getTemplateDraftKey(templateId) {
    const key = templateId || "preset-web";
    return `vmax_quote_draft_${encodeURIComponent(key)}`;
}

/**
 * Lưu dữ liệu nháp vào localStorage & IndexedDB độc lập theo mẫu
 * @param {boolean} showNotification - Có hiện thông báo toast không
 */
function saveDraft(showNotification = true) {
    try {
        updateQuoteData({ renderPreview: false });
        
        const activeTemplate = quoteData.activeTemplate || "preset-web";
        localStorage.setItem("vmax_quote_active_template", activeTemplate);
        
        // Lưu theo key riêng độc lập của mẫu (VD: vmax_quote_draft_preset-web, vmax_quote_draft_preset-seo)
        const draftKey = getTemplateDraftKey(activeTemplate);
        localStorage.setItem(draftKey, JSON.stringify(quoteData));

        // Lưu bản sao dự phòng vào IndexedDB theo key của mẫu
        openVmaxDB().then(db => {
            const tx = db.transaction("quotations", "readwrite");
            const store = tx.objectStore("quotations");
            store.put({
                id: `draft_${activeTemplate}`,
                data: quoteData,
                updatedAt: new Date().toISOString()
            });
        }).catch(err => console.warn("IndexedDB draft backup error:", err));

        setSaveStatus("saved");
        
        if (showNotification) {
            showToast("Đã lưu bảng nháp báo giá thành công!");
        }
    } catch (e) {
        console.error("Lỗi khi lưu bản nháp:", e);
        setSaveStatus("unsaved");
    }
}

/**
 * Kiểm tra và ràng buộc tính hợp lệ của dữ liệu trước khi xuất PDF
 */
function validateQuoteData(options = { showNotification: true }) {
    updateQuoteData();
    const errors = [];
    
    // Xóa các class lỗi cũ
    document.querySelectorAll(".vmax-quote-input-error").forEach(el => el.classList.remove("vmax-quote-input-error"));
    document.querySelectorAll(".vmax-quote-error-msg").forEach(el => el.style.display = "none");

    // 1. Trường bắt buộc: Tên công ty
    const compName = document.getElementById("comp-name");
    if (!quoteData.company.name || !quoteData.company.name.trim()) {
        errors.push("Tên công ty không được để trống");
        if (compName) compName.classList.add("vmax-quote-input-error");
        const errEl = document.getElementById("err-comp-name");
        if (errEl) errEl.style.display = "block";
    }

    // 2. Trường bắt buộc: Tiêu đề báo giá
    const quoteTitle = document.getElementById("quote-title");
    if (!quoteData.quotation.title || !quoteData.quotation.title.trim()) {
        errors.push("Tiêu đề báo giá không được để trống");
        if (quoteTitle) quoteTitle.classList.add("vmax-quote-input-error");
        const errEl = document.getElementById("err-quote-title");
        if (errEl) errEl.style.display = "block";
    }

    // 3. Trường bắt buộc: Tên dự án
    const custProject = document.getElementById("cust-project");
    if (!quoteData.customer.projectName || !quoteData.customer.projectName.trim()) {
        errors.push("Tên dự án không được để trống");
        if (custProject) custProject.classList.add("vmax-quote-input-error");
        const errEl = document.getElementById("err-cust-project");
        if (errEl) errEl.style.display = "block";
    }

    // 4. Trường bắt buộc: Giá dịch vụ (> 0)
    const priceService = document.getElementById("price-service");
    if (isNaN(quoteData.pricing.servicePrice) || quoteData.pricing.servicePrice <= 0) {
        errors.push("Giá dịch vụ phải lớn hơn 0");
        if (priceService) priceService.classList.add("vmax-quote-input-error");
        const errEl = document.getElementById("err-price-service");
        if (errEl) errEl.style.display = "block";
    }

    // 5. Trường bắt buộc: Thời gian thực hiện
    const timeDuration = document.getElementById("time-duration");
    if (!quoteData.timeline.duration || !quoteData.timeline.duration.trim()) {
        errors.push("Thời gian thực hiện không được để trống");
        if (timeDuration) timeDuration.classList.add("vmax-quote-input-error");
    }

    // 6. Kiểm tra định dạng Email (nếu có nhập)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (quoteData.company.email && quoteData.company.email.trim() && !emailRegex.test(quoteData.company.email.trim())) {
        errors.push("Email công ty không đúng định dạng");
        const compEmail = document.getElementById("comp-email");
        if (compEmail) compEmail.classList.add("vmax-quote-input-error");
    }
    if (quoteData.customer.email && quoteData.customer.email.trim() && !emailRegex.test(quoteData.customer.email.trim())) {
        errors.push("Email khách hàng không đúng định dạng");
        const custEmail = document.getElementById("cust-email");
        if (custEmail) custEmail.classList.add("vmax-quote-input-error");
    }

    // 7. Kiểm tra định dạng Số điện thoại (nếu có nhập)
    const phoneRegex = /^[0-9+\s().-]{8,20}$/;
    if (quoteData.company.hotline && quoteData.company.hotline.trim() && !phoneRegex.test(quoteData.company.hotline.trim())) {
        errors.push("Hotline công ty không đúng định dạng");
        const compHotline = document.getElementById("comp-hotline");
        if (compHotline) compHotline.classList.add("vmax-quote-input-error");
    }

    if (errors.length > 0) {
        if (options.showNotification) {
            showToast("Vui lòng sửa các trường lỗi trước khi xuất PDF: " + errors[0], "danger");
        }
        return false;
    }
    
    return true;
}

/**
 * Khôi phục dữ liệu nháp cũ gần nhất
 */
function restoreDraft() {
    const activeTemplate = quoteData.activeTemplate || "preset-web";
    const draftKey = getTemplateDraftKey(activeTemplate);
    const saved = localStorage.getItem(draftKey);
    if (!saved) {
        showToast("Không tìm thấy bản lưu nháp nào!", "danger");
        return;
    }
    
    try {
        quoteData = JSON.parse(saved);
        quoteData = mergeDeep({}, DEFAULT_QUOTE_DATA, quoteData);
        
        fillFormFromData();
        calculatePricing();
        renderPreview();
        
        // Đồng bộ lại dropdown mẫu báo giá
        const select = document.getElementById("vmax-quote-template-select");
        if (select) {
            select.value = quoteData.activeTemplate || "";
            const deleteBtn = document.getElementById("vmax-quote-btn-delete-template");
            if (deleteBtn) {
                if (quoteData.activeTemplate && quoteData.activeTemplate.startsWith("custom-")) {
                    deleteBtn.style.display = "inline-block";
                } else {
                    deleteBtn.style.display = "none";
                }
            }
        }
        
        showToast("Đã khôi phục dữ liệu từ bản nháp gần nhất!");
    } catch (e) {
        showToast("Lỗi khôi phục bản nháp", "danger");
    }
}

/**
 * Đặt lại dữ liệu báo giá về mặc định ban đầu
 */
async function resetQuote() {
    const confirmReset = await showConfirmModal(
        "Đặt lại báo giá",
        "Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại và khôi phục về báo giá mặc định ban đầu không?"
    );
    
    if (confirmReset) {
        const select = document.getElementById("vmax-quote-template-select");
        const activeTemplate = select ? select.value : "";
        
        if (activeTemplate) {
            localStorage.removeItem(getTemplateDraftKey(activeTemplate));
            
            // Nếu là mẫu hệ thống (preset), tải lại cấu hình mặc định của preset đó
            if (activeTemplate.startsWith("preset-") && PRESET_TEMPLATES[activeTemplate]) {
                const defaultPreset = JSON.parse(JSON.stringify(PRESET_TEMPLATES[activeTemplate]));
                defaultPreset.company = JSON.parse(JSON.stringify(quoteData.company));
                quoteData = mergeDeep({}, DEFAULT_QUOTE_DATA, defaultPreset);
                quoteData.activeTemplate = activeTemplate;
            } else if (activeTemplate.startsWith("custom-")) {
                // Nếu là mẫu riêng, tải lại từ IndexedDB
                const templateName = activeTemplate.substring(7);
                try {
                    const dbInstance = await openVmaxDB();
                    const transaction = dbInstance.transaction(["templates"], "readonly");
                    const store = transaction.objectStore("templates");
                    const request = store.get(templateName);
                    
                    await new Promise((resolve) => {
                        request.onsuccess = () => {
                            const data = request.result;
                            if (data) {
                                quoteData = mergeDeep({}, DEFAULT_QUOTE_DATA, data);
                                quoteData.activeTemplate = activeTemplate;
                            } else {
                                quoteData = JSON.parse(JSON.stringify(DEFAULT_QUOTE_DATA));
                            }
                            resolve();
                        };
                        request.onerror = () => {
                            quoteData = JSON.parse(JSON.stringify(DEFAULT_QUOTE_DATA));
                            resolve();
                        };
                    });
                } catch (err) {
                    console.error("Error resetting custom template:", err);
                    quoteData = JSON.parse(JSON.stringify(DEFAULT_QUOTE_DATA));
                }
            } else {
                quoteData = JSON.parse(JSON.stringify(DEFAULT_QUOTE_DATA));
            }
        } else {
            localStorage.removeItem(getTemplateDraftKey("preset-web"));
            quoteData = loadDefaultTemplateData("preset-web");
        }
        
        // Xóa logo và chữ ký đã tải trong giao diện
        document.getElementById("comp-logo-name").textContent = "Chưa có tệp nào được chọn";
        document.getElementById("comp-logo").value = "";
        
        const sigCustName = document.getElementById("signature-cust-img-name");
        if (sigCustName) sigCustName.textContent = "Chưa có tệp nào được chọn";
        const sigCustInput = document.getElementById("signature-cust-img");
        if (sigCustInput) sigCustInput.value = "";
        const sigCustPreviewImg = document.getElementById("vmax-quote-signature-cust-preview-img");
        if (sigCustPreviewImg) {
            sigCustPreviewImg.src = "";
            sigCustPreviewImg.style.display = "none";
        }

        const sigCompName = document.getElementById("signature-comp-img-name");
        if (sigCompName) sigCompName.textContent = "Chưa có tệp nào được chọn";
        const sigCompInput = document.getElementById("signature-comp-img");
        if (sigCompInput) sigCompInput.value = "";
        const sigCompPreviewImg = document.getElementById("vmax-quote-signature-comp-preview-img");
        if (sigCompPreviewImg) {
            sigCompPreviewImg.src = "";
            sigCompPreviewImg.style.display = "none";
        }
        quoteData._initialized = true;
        quoteData._userClearedItems = false;
        
        rebuildItemsSidebarList(true);
        fillFormFromData();
        calculatePricing();
        renderPreview();
        
        // Lưu lại bản nháp đã xóa/đặt lại
        saveDraft(false);
        
        showToast("Đã đặt lại dữ liệu về mặc định thành công!");
    }
}


// --- XUẤT FILE PDF & IN ẤN ---

// Biến lưu trạng thái editability của preview toàn cục để khôi phục sau in
let isDirectEditActiveGlobal = false;

// Đợi hai frame render để trình duyệt hoàn tất cập nhật CSS và Layout DOM
function waitTwoFrames() {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

/**
 * Thuật toán phân trang động bằng JavaScript:
 * Tách nội dung thành nhiều trang .pdf-page A4 dựa vào chiều cao khả dụng thực tế của DOM.
 */
async function paginateQuotation() {
    const originalPage = document.getElementById("vmax-quote-page-print");
    if (!originalPage) return;
    
    const wrapper = document.getElementById("vmax-quote-preview-wrapper-id");
    if (!wrapper) return;
    
    // Xóa tài liệu in động cũ nếu có
    let pdfDoc = document.getElementById("vmax-quote-pdf-document");
    if (pdfDoc) pdfDoc.remove();
    
    // Tạo tài liệu in động mới
    pdfDoc = document.createElement("div");
    pdfDoc.id = "vmax-quote-pdf-document";
    pdfDoc.className = "vmax-quote-pdf-document";
    wrapper.appendChild(pdfDoc);
    
    let pageCount = 0;
    
    // Hàm sinh một trang A4 in động
    function createNewPageElement() {
        pageCount++;
        const page = document.createElement("div");
        page.className = "pdf-page";
        page.setAttribute("data-page-num", pageCount);
        
        let headerHtml = "";
        if (pageCount > 1) {
            const logoSrc = getCompanyLogoUrl();
            headerHtml = `
                <header class="pdf-page-header">
                    <div class="pdf-page-header-content">
                        <img src="${logoSrc}" alt="Logo VMAX" class="pdf-page-header-logo">
                        <div class="pdf-page-header-text">
                            <span class="pdf-page-header-title">BẢNG BÁO GIÁ DỊCH VỤ VMAX</span>
                            <span class="pdf-page-header-subtitle">Trang tiếp theo</span>
                        </div>
                    </div>
                    <div class="pdf-page-header-divider"></div>
                </header>
            `;
        }
        
        const footerHtml = `
            <footer class="pdf-page-footer">
                <div class="pdf-page-footer-line"></div>
                <div class="pdf-page-footer-content">
                    <span class="pdf-page-footer-left">Công ty TNHH Công Nghệ Số VMAX - Hotline: 0825.99.33.55 - Website: vmaxtech.vn</span>
                    <span class="pdf-page-footer-right">Trang ${pageCount}</span>
                </div>
            </footer>
        `;
        
        page.innerHTML = `
            ${headerHtml}
            <div class="pdf-page-content"></div>
            ${footerHtml}
        `;
        
        pdfDoc.appendChild(page);
        return page;
    }
    
    // Khởi tạo trang 1
    let currentPage = createNewPageElement();
    let currentContentContainer = currentPage.querySelector(".pdf-page-content");
    
    // Lấy chiều cao khả dụng thực tế trên trang (do flex tự tính)
    let maxContentHeight = currentContentContainer.clientHeight;
    if (maxContentHeight <= 0) {
        maxContentHeight = 850; // Fallback an toàn nếu chưa kịp đo trong DOM ẩn
    }
    
    // 1. Phân chia thông tin đầu trang 1
    const compHeader = originalPage.querySelector(".vmax-quote-page-header").cloneNode(true);
    const titleSection = originalPage.querySelector(".vmax-quote-page-title-section").cloneNode(true);
    const custHeader = originalPage.querySelector(".vmax-quote-page-section-header").cloneNode(true);
    const custBox = originalPage.querySelector(".vmax-quote-page-customer-box").cloneNode(true);
    
    currentContentContainer.appendChild(compHeader);
    currentContentContainer.appendChild(titleSection);
    currentContentContainer.appendChild(custHeader);
    currentContentContainer.appendChild(custBox);
    
    // Biến đếm số lượng nội dung thực tế trên trang hiện tại
    let contentCount = 4; 
    
    // 2. Chuẩn bị thẻ dự án
    const projectCard = originalPage.querySelector(".vmax-quote-page-project-card");
    const projHeader = projectCard.querySelector(".vmax-quote-page-project-header").cloneNode(true);
    const projSubheader = projectCard.querySelector(".vmax-quote-page-project-subheader").cloneNode(true);
    
    let currentProjCard = document.createElement("div");
    currentProjCard.className = "vmax-quote-page-project-card";
    currentProjCard.appendChild(projHeader);
    currentProjCard.appendChild(projSubheader);
    
    let currentProjBody = document.createElement("div");
    currentProjBody.className = "vmax-quote-page-project-body";
    currentProjBody.id = "vmax-quote-page-items-preview-" + pageCount;
    currentProjCard.appendChild(currentProjBody);
    
    currentContentContainer.appendChild(currentProjCard);
    contentCount++;
    
    const itemsPreview = projectCard.querySelector("#vmax-quote-page-items-preview");
    
    // --- CHẾ ĐỘ THẺ/BULLET (CARD MODE) ---
    const cards = Array.from(itemsPreview.querySelectorAll(".vmax-quote-page-item-row"));
    
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i].cloneNode(true);
        currentProjBody.appendChild(card);
        
        if (currentContentContainer.scrollHeight > maxContentHeight) {
            card.remove();
            
            if (currentProjBody.children.length === 0 && contentCount === 5 && pageCount === 1) {
                currentProjCard.remove();
                
                currentPage = createNewPageElement();
                currentContentContainer = currentPage.querySelector(".pdf-page-content");
                maxContentHeight = currentContentContainer.clientHeight || 850;
                contentCount = 0;
                
                currentProjCard = document.createElement("div");
                currentProjCard.className = "vmax-quote-page-project-card";
                currentProjCard.appendChild(projHeader.cloneNode(true));
                currentProjCard.appendChild(projSubheader.cloneNode(true));
                
                currentProjBody = document.createElement("div");
                currentProjBody.className = "vmax-quote-page-project-body";
                currentProjBody.id = "vmax-quote-page-items-preview-" + pageCount;
                currentProjCard.appendChild(currentProjBody);
                currentContentContainer.appendChild(currentProjCard);
                contentCount++;
                
                currentProjBody.appendChild(card);
                
                if (currentContentContainer.scrollHeight > maxContentHeight) {
                    card.remove();
                    splitAndDistributeCard(card);
                }
            } else if (currentProjBody.children.length === 0 && contentCount === 1) {
                splitAndDistributeCard(card);
            } else {
                currentPage = createNewPageElement();
                currentContentContainer = currentPage.querySelector(".pdf-page-content");
                maxContentHeight = currentContentContainer.clientHeight || 850;
                contentCount = 0;
                
                currentProjCard = document.createElement("div");
                currentProjCard.className = "vmax-quote-page-project-card";
                currentProjCard.appendChild(projHeader.cloneNode(true));
                currentProjCard.appendChild(projSubheader.cloneNode(true));
                
                currentProjBody = document.createElement("div");
                currentProjBody.className = "vmax-quote-page-project-body";
                currentProjBody.id = "vmax-quote-page-items-preview-" + pageCount;
                currentProjCard.appendChild(currentProjBody);
                currentContentContainer.appendChild(currentProjCard);
                contentCount++;
                
                currentProjBody.appendChild(card);
                
                if (currentContentContainer.scrollHeight > maxContentHeight) {
                    card.remove();
                    splitAndDistributeCard(card);
                }
            }
        }
    }
    

    
    // Hàm phụ: Phân tách thẻ (Bullet Card) quá dài theo từng bullet points
    function splitAndDistributeCard(originalCard) {
        const bullets = Array.from(originalCard.querySelectorAll(".vmax-quote-page-item-bullets li"));
        
        if (bullets.length <= 1) {
            currentProjBody.appendChild(originalCard);
            originalCard.classList.add("pdf-overflow-error");
            return;
        }
        
        let cardClone = originalCard.cloneNode(true);
        let listContainer = cardClone.querySelector(".vmax-quote-page-item-bullets");
        listContainer.innerHTML = "";
        currentProjBody.appendChild(cardClone);
        
        let addedBulletsCount = 0;
        
        for (let j = 0; j < bullets.length; j++) {
            const bullet = bullets[j].cloneNode(true);
            listContainer.appendChild(bullet);
            addedBulletsCount++;
            
            if (currentContentContainer.scrollHeight > maxContentHeight) {
                if (addedBulletsCount === 1) {
                    bullet.classList.add("pdf-overflow-error");
                } else {
                    bullet.remove();
                    addedBulletsCount--;
                    
                    currentPage = createNewPageElement();
                    currentContentContainer = currentPage.querySelector(".pdf-page-content");
                    maxContentHeight = currentContentContainer.clientHeight || 850;
                    contentCount = 0;
                    
                    currentProjCard = document.createElement("div");
                    currentProjCard.className = "vmax-quote-page-project-card";
                    currentProjCard.appendChild(projHeader.cloneNode(true));
                    currentProjCard.appendChild(projSubheader.cloneNode(true));
                    
                    currentProjBody = document.createElement("div");
                    currentProjBody.className = "vmax-quote-page-project-body";
                    currentProjBody.id = "vmax-quote-page-items-preview-" + pageCount;
                    currentProjCard.appendChild(currentProjBody);
                    currentContentContainer.appendChild(currentProjCard);
                    contentCount++;
                    
                    cardClone = originalCard.cloneNode(true);
                    const newTitleEl = cardClone.querySelector(".vmax-quote-page-item-title");
                    if (newTitleEl) {
                        newTitleEl.textContent = newTitleEl.textContent.trim() + " (tiếp theo)";
                    }
                    listContainer = cardClone.querySelector(".vmax-quote-page-item-bullets");
                    listContainer.innerHTML = "";
                    currentProjBody.appendChild(cardClone);
                    
                    listContainer.appendChild(bullet);
                    addedBulletsCount = 1;
                    
                    if (currentContentContainer.scrollHeight > maxContentHeight) {
                        bullet.classList.add("pdf-overflow-error");
                    }
                }
            }
        }
    }
    
    // 3. Phân chia cụm summary-group (Bảng giá và điều khoản timeline)
    const pricingSection = originalPage.querySelector(".vmax-quote-page-pricing-section").cloneNode(true);
    const bottomSection = originalPage.querySelector(".vmax-quote-page-bottom-section").cloneNode(true);
    
    const summaryGroup = document.createElement("div");
    summaryGroup.className = "pdf-summary-group";
    summaryGroup.appendChild(pricingSection);
    summaryGroup.appendChild(bottomSection);
    
    currentContentContainer.appendChild(summaryGroup);
    
    if (currentContentContainer.scrollHeight > maxContentHeight) {
        summaryGroup.remove();
        
        currentPage = createNewPageElement();
        currentContentContainer = currentPage.querySelector(".pdf-page-content");
        maxContentHeight = currentContentContainer.clientHeight || 850;
        contentCount = 0;
        
        currentContentContainer.appendChild(summaryGroup);
        contentCount++;
        
        if (currentContentContainer.scrollHeight > maxContentHeight) {
            summaryGroup.classList.add("pdf-overflow-error");
        }
    } else {
        contentCount++;
    }
    
    // 4. Phân chia cụm signature-group (Chữ ký và con dấu)
    const originalSigPanel = originalPage.querySelector("#vmax-quote-signatures-panel");
    if (originalSigPanel && originalSigPanel.style.display !== "none") {
        const sigPanel = originalSigPanel.cloneNode(true);
        sigPanel.className = "pdf-signature-group";
        
        currentContentContainer.appendChild(sigPanel);
        
        if (currentContentContainer.scrollHeight > maxContentHeight) {
            sigPanel.remove();
            
            currentPage = createNewPageElement();
            currentContentContainer = currentPage.querySelector(".pdf-page-content");
            maxContentHeight = currentContentContainer.clientHeight || 850;
            contentCount = 0;
            
            currentContentContainer.appendChild(sigPanel);
            contentCount++;
            
            if (currentContentContainer.scrollHeight > maxContentHeight) {
                sigPanel.classList.add("pdf-overflow-error");
            }
        } else {
            contentCount++;
        }
    }
    
    // 5. Cập nhật số trang động ở footer của tất cả các trang
    const pages = Array.from(pdfDoc.querySelectorAll(".pdf-page"));
    pages.forEach((p, idx) => {
        const rightSpan = p.querySelector(".pdf-page-footer-right");
        if (rightSpan) {
            rightSpan.textContent = `Trang ${idx + 1} / ${pages.length}`;
        }
    });
}

/**
 * In trực tiếp bằng lệnh in của Trình duyệt
 */
async function printQuote() {
    const isDirectEditChecked = document.getElementById("vmax-quote-page-print").classList.contains("vmax-quote-editable-active");
    isDirectEditActiveGlobal = isDirectEditChecked;
    
    if (isDirectEditChecked) {
        setPreviewEditableState(false);
    }
    
    // Bật chế độ pdf-print-mode
    document.body.classList.add("pdf-print-mode");
    
    try {
        // Chờ font và ảnh tải xong
        await waitForAssetsReady();
        
        // Chờ 2 frame render của trình duyệt
        await waitTwoFrames();
        
        // Thực hiện thuật phân trang động
        await paginateQuotation();
        
        // Chờ thêm ảnh ở các trang tiếp theo (logo trang 2+) tải xong hoàn toàn
        await waitForAssetsReady();
        await waitTwoFrames();
        
        // Đăng ký dọn dẹp DOM sau khi in xong
        const cleanupPrintHandler = () => {
            const pdfDoc = document.getElementById("vmax-quote-pdf-document");
            if (pdfDoc) pdfDoc.remove();
            document.body.classList.remove("pdf-print-mode");
            if (isDirectEditActiveGlobal) {
                setPreviewEditableState(true);
            }
        };
        window.addEventListener('afterprint', cleanupPrintHandler, { once: true });
        
        // Gọi lệnh in mặc định
        window.print();
    } catch (err) {
        console.error("Print error:", err);
        // Khôi phục trong trường hợp có lỗi xảy ra
        const pdfDoc = document.getElementById("vmax-quote-pdf-document");
        if (pdfDoc) pdfDoc.remove();
        document.body.classList.remove("pdf-print-mode");
        if (isDirectEditActiveGlobal) {
            setPreviewEditableState(true);
        }
    }
}

/**
 * Xuất file PDF tự động bằng IPC gọi Electron printToPDF
 */
async function exportToPDF() {
    // 1. Kiểm tra tính hợp lệ của dữ liệu trước khi cho phép xuất PDF
    if (!validateQuoteData({ showNotification: true })) {
        return;
    }

    const code = quoteData.quotation.code || "BG";
    const clientName = quoteData.customer.name || "KhachHang";
    const projName = quoteData.customer.projectName || "DuAn";
    const filename = `Bao-gia_${sanitizeFilename(code)}_${sanitizeFilename(clientName)}_${sanitizeFilename(projName)}.pdf`;

    const loadingOverlay = document.getElementById("vmax-quote-loading");
    const loadingMsg = document.getElementById("vmax-quote-loading-msg");
    const exportBtn = document.getElementById("vmax-quote-btn-export-pdf");
    const exportBtnMob = document.getElementById("vmax-quote-btn-mob-export");
    
    if (exportBtn) exportBtn.disabled = true;
    if (exportBtnMob) exportBtnMob.disabled = true;

    if (loadingOverlay) {
        loadingMsg.textContent = "Đang kết xuất báo giá A4 thành file PDF...";
        loadingOverlay.style.display = "flex";
    }

    const isDirectEditChecked = document.getElementById("vmax-quote-page-print").classList.contains("vmax-quote-editable-active");
    if (isDirectEditChecked) {
        setPreviewEditableState(false);
    }

    try {
        if (window.electronAPI) {
            document.body.classList.add("pdf-print-mode");
            
            await waitForAssetsReady();
            await waitTwoFrames();
            
            await paginateQuotation();
            await waitForAssetsReady();
            await waitTwoFrames();

            const result = await window.electronAPI.exportPDF(filename);
            
            if (result.success) {
                showToast("Đã xuất và lưu tệp PDF thành công!");
            } else if (result.error !== 'Cancelled') {
                showToast("Gặp sự cố khi xuất PDF: " + result.error, "danger");
            }
        } else {
            showToast("Vui lòng sử dụng tính năng in của trình duyệt (Ctrl+P) để lưu PDF.", "warning");
            
            document.body.classList.add("pdf-print-mode");
            await waitForAssetsReady();
            await waitTwoFrames();
            await paginateQuotation();
            await waitForAssetsReady();
            await waitTwoFrames();
            
            const cleanupPrintHandler = () => {
                const pdfDoc = document.getElementById("vmax-quote-pdf-document");
                if (pdfDoc) pdfDoc.remove();
                document.body.classList.remove("pdf-print-mode");
                if (isDirectEditChecked) {
                    setPreviewEditableState(true);
                }
            };
            window.addEventListener('afterprint', cleanupPrintHandler, { once: true });
            
            window.print();
        }
    } catch (err) {
        console.error("PDF export error:", err);
        showToast("Lỗi khi xuất PDF: " + err.message, "danger");
    } finally {
        const pdfDoc = document.getElementById("vmax-quote-pdf-document");
        if (pdfDoc) pdfDoc.remove();
        
        document.body.classList.remove("pdf-print-mode");

        if (isDirectEditChecked) {
            setPreviewEditableState(true);
        }

        if (loadingOverlay) loadingOverlay.style.display = "none";
        if (exportBtn) exportBtn.disabled = false;
        if (exportBtnMob) exportBtnMob.disabled = false;
    }
}


/**
 * Xuất file báo giá định dạng Word (.doc) có thể chỉnh sửa tự do
 */
function exportToWord() {
    const element = document.getElementById("vmax-quote-page-print");
    const clientName = quoteData.customer.name || "KH";
    const filename = `Bao-gia-VMAX-${sanitizeFilename(clientName)}.doc`;

    // Hiện loading
    const loadingOverlay = document.getElementById("vmax-quote-loading");
    const loadingMsg = document.getElementById("vmax-quote-loading-msg");
    loadingMsg.textContent = "Đang kết xuất báo giá A4 thành file Word...";
    loadingOverlay.style.display = "flex";

    try {
        // Tắt chế độ sửa trực tiếp để văn bản hiển thị sạch sẽ
        const isDirectEditChecked = document.getElementById("vmax-quote-page-print").classList.contains("vmax-quote-editable-active");
        if (isDirectEditChecked) {
            setPreviewEditableState(false);
        }

        // Lấy toàn bộ mã HTML bên trong bản A4
        const htmlContent = element.innerHTML;

        // Tạo khung bao HTML & XML dành riêng cho MS Word để giữ nguyên thiết kế cơ bản
        const sourceHTML = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <title>Báo giá dịch vụ VMAX</title>
                <!--[if gte mso 9]>
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>100</w:Zoom>
                        <w:DoNotOptimizeForBrowser/>
                    </w:WordDocument>
                </xml>
                <![endif]-->
                <style>
                    body {
                        font-family: 'Be Vietnam Pro', Arial, sans-serif;
                        color: #333333;
                    }
                    /* Tái hiện giao diện bảng báo giá VMAX trong Word */
                    .vmax-quote-page-header {
                        border: 2px solid #135E2D;
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 20px;
                    }
                    .vmax-quote-page-comp-name {
                        color: #135E2D;
                        font-size: 14pt;
                        font-weight: bold;
                    }
                    .vmax-quote-page-comp-text {
                        font-size: 10pt;
                    }
                    .vmax-quote-page-title {
                        color: #135E2D;
                        font-size: 18pt;
                        font-weight: bold;
                        text-align: center;
                        text-transform: uppercase;
                    }
                    .vmax-quote-page-subtitle {
                        font-size: 10pt;
                        font-style: italic;
                        text-align: center;
                    }
                    .vmax-quote-page-customer-box {
                        border: 1px solid #135E2D;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    .vmax-quote-page-customer-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .vmax-quote-page-customer-table td {
                        padding: 8px;
                        font-size: 10pt;
                        border-bottom: 1px solid #C6E0CE;
                    }
                    .vmax-quote-cust-label {
                        background-color: #F3F4F6;
                        font-weight: bold;
                        width: 180px;
                    }
                    .vmax-quote-page-project-card {
                        border: 2px solid #135E2D;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    }
                    .vmax-quote-page-project-header {
                        background-color: #135E2D;
                        color: #ffffff;
                        padding: 10px;
                        font-weight: bold;
                        font-size: 10pt;
                    }
                    .vmax-quote-page-project-body {
                        padding: 15px;
                    }
                    .vmax-quote-page-item-row {
                        margin-bottom: 10px;
                        border-bottom: 1px dashed #E2E8F0;
                        padding-bottom: 10px;
                    }
                    .vmax-quote-page-item-num {
                        background-color: #135E2D;
                        color: #ffffff;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        text-align: center;
                        font-weight: bold;
                        display: inline-block;
                    }
                    .vmax-quote-page-item-title {
                        font-weight: bold;
                        font-size: 10pt;
                        margin-left: 5px;
                    }
                    .vmax-quote-page-item-bullets {
                        margin-left: 20px;
                    }
                    .vmax-quote-page-pricing-section {
                        border: 2px solid #135E2D;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    }
                    .vmax-quote-page-pricing-left {
                        background-color: #EAF7ED;
                        width: 120px;
                        font-weight: bold;
                        color: #135E2D;
                        text-align: center;
                    }
                    .vmax-quote-page-pricing-table-new {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .vmax-quote-page-pricing-table-new td {
                        padding: 8px;
                        font-size: 10pt;
                        border-bottom: 1px solid #C6E0CE;
                    }
                    .vmax-quote-price-total-row {
                        background-color: #EAF7ED;
                    }
                    .vmax-quote-price-total-label, .vmax-quote-price-total-val {
                        color: #135E2D;
                        font-weight: bold;
                    }
                    .vmax-quote-page-bottom-section {
                        margin-bottom: 20px;
                    }
                    .vmax-quote-page-bottom-box {
                        border: 2px solid #135E2D;
                        border-radius: 10px;
                        padding: 10px;
                        margin-bottom: 10px;
                    }
                    .vmax-quote-page-bottom-label {
                        font-size: 9pt;
                        color: #666;
                    }
                    .vmax-quote-page-bottom-val-words {
                        font-weight: bold;
                        font-size: 10pt;
                    }
                    .vmax-quote-page-bottom-val-timeline {
                        font-weight: bold;
                        font-size: 12pt;
                        color: #135E2D;
                    }
                    /* Custom Items Table in Word */
                    .vmax-quote-page-custom-items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    .vmax-quote-page-custom-items-table th {
                        background-color: #135E2D;
                        color: #ffffff;
                        padding: 8px;
                        font-size: 10pt;
                        font-weight: bold;
                        border: 1px solid #135E2D;
                    }
                    .vmax-quote-page-custom-items-table td {
                        padding: 8px;
                        font-size: 10pt;
                        border: 1px solid #C6E0CE;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff' + sourceHTML], {
            type: 'application/vnd.ms-word;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Bật lại chế độ trực tiếp nếu có
        if (isDirectEditChecked) {
            setPreviewEditableState(true);
        }

        showToast("Đã xuất và tải xuống file Word (.doc) thành công!");
    } catch (err) {
        console.error("Word export error:", err);
        showToast("Gặp sự cố khi xuất file Word: " + err.message, "danger");
    } finally {
        loadingOverlay.style.display = "none";
    }
}

/**
 * Hàm chuẩn hóa tên file (Loại bỏ tiếng Việt có dấu, ký tự đặc biệt)
 */
function sanitizeFilename(text) {
    if (!text) return "VMAX";
    let str = text.trim();
    
    // Thay đổi chữ hoa/thường
    str = str.toLowerCase();
    
    // Loại bỏ dấu tiếng Việt
    const unicodeMap = {
        "a": "á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ",
        "d": "đ",
        "e": "é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ",
        "i": "í|ì|ỉ|ĩ|ị",
        "o": "ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ",
        "u": "ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự",
        "y": "ý|ỳ|ỷ|ỹ|ỵ"
    };

    for (let nonAccent in unicodeMap) {
        let pattern = new RegExp(unicodeMap[nonAccent], "gi");
        str = str.replace(pattern, nonAccent);
    }
    
    // Loại bỏ các ký tự đặc biệt, thay khoảng trắng thành dấu gạch ngang
    str = str.replace(/[^a-z0-9\s-]/g, "")
             .replace(/\s+/g, "-")
             .replace(/-+/g, "-")
             .replace(/^-+|-+$/g, ""); // Xóa gạch ngang ở đầu/cuối
             
    // Trả về định dạng viết hoa cho đẹp (e.g. MVP-ACADEMY)
    return str.toUpperCase();
}


// --- TIỆN ÍCH DỮ LIỆU ---

/**
 * Gộp hai Object sâu (Deep Merge Helper)
 */
function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else if (Array.isArray(source[key])) {
                // Đối với mảng (như items), ghi đè bằng mảng mới để tránh trộn lẫn sai phần tử
                target[key] = JSON.parse(JSON.stringify(source[key]));
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Hiển thị hộp thoại xác nhận tùy chỉnh (Custom Confirmation Modal)
 */
function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById("vmax-quote-confirm-modal");
        const titleEl = document.getElementById("vmax-quote-modal-title-text");
        const bodyEl = document.getElementById("vmax-quote-modal-body-text");
        const confirmBtn = document.getElementById("vmax-quote-modal-btn-confirm");
        const cancelBtn = document.getElementById("vmax-quote-modal-btn-cancel");
        const closeBtn = document.getElementById("vmax-quote-modal-close-btn");

        titleEl.textContent = title;
        bodyEl.textContent = message;
        overlay.style.display = "flex";

        const cleanup = (value) => {
            confirmBtn.removeEventListener("click", onConfirm);
            cancelBtn.removeEventListener("click", onCancel);
            closeBtn.removeEventListener("click", onCancel);
            overlay.style.display = "none";
            resolve(value);
        };

        const onConfirm = () => cleanup(true);
        const onCancel = () => cleanup(false);

        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
        closeBtn.addEventListener("click", onCancel);
    });
}

/**
 * Khởi tạo SortableJS kéo thả cho danh sách dòng khách hàng
 */
let customerSortableInstance = null;
function initCustomerSortable() {
    const list = document.getElementById("vmax-quote-customer-rows-list");
    if (!list) return;
    if (customerSortableInstance) {
        customerSortableInstance.destroy();
    }
    
    customerSortableInstance = Sortable.create(list, {
        handle: ".vmax-quote-row-drag-handle",
        ghostClass: "vmax-quote-item-ghost",
        animation: 150,
        onEnd: () => {
            const newRows = [];
            const cards = list.querySelectorAll(".vmax-quote-customer-row-card");
            cards.forEach(card => {
                const idx = parseInt(card.dataset.tempIdx);
                newRows.push(quoteData.customerRows[idx]);
            });
            quoteData.customerRows = newRows;
            
            renderCustomerRowsPreview();
            rebuildCustomerRowsList(false); // Cập nhật liên kết index
            triggerAutosave();
        }
    });
}

/**
 * Xây dựng danh sách giao diện dòng khách hàng ở sidebar
 */
function rebuildCustomerRowsList(fullRebuild = true) {
    const listContainer = document.getElementById("vmax-quote-customer-rows-list");
    if (!listContainer) return;
    
    if (fullRebuild) {
        listContainer.innerHTML = "";
    }
    
    quoteData.customerRows.forEach((row, index) => {
        if (fullRebuild) {
            const card = document.createElement("div");
            card.className = "vmax-quote-customer-row-card";
            if (!row.visible) {
                card.classList.add("vmax-quote-row-hidden");
            }
            card.dataset.tempIdx = index;
            
            // Drag handle
            const dragHandle = document.createElement("span");
            dragHandle.className = "vmax-quote-row-drag-handle vmax-quote-item-drag-handle";
            dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';
            
            // Inputs container
            const inputsWrap = document.createElement("div");
            inputsWrap.className = "vmax-quote-customer-row-inputs";
            
            const labelInput = document.createElement("input");
            labelInput.type = "text";
            labelInput.className = "vmax-quote-input row-label-input";
            labelInput.value = row.label;
            labelInput.placeholder = "Tên trường...";
            labelInput.addEventListener("input", (e) => {
                row.label = e.target.value;
                renderCustomerRowsPreview();
                triggerAutosave();
            });
            
            const valInput = document.createElement("input");
            valInput.type = "text";
            valInput.className = "vmax-quote-input row-value-input";
            valInput.value = row.value;
            valInput.placeholder = "Giá trị...";
            valInput.addEventListener("input", (e) => {
                row.value = e.target.value;
                renderCustomerRowsPreview();
                triggerAutosave();
            });
            
            inputsWrap.appendChild(labelInput);
            inputsWrap.appendChild(valInput);
            
            // Actions
            const actions = document.createElement("div");
            actions.className = "vmax-quote-customer-row-actions";
            
            // Toggle visibility button
            const btnToggle = document.createElement("button");
            btnToggle.type = "button";
            btnToggle.className = "vmax-quote-btn-icon-secondary";
            btnToggle.title = row.visible ? "Ẩn hàng" : "Hiện hàng";
            btnToggle.innerHTML = `<i class="fas ${row.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
            btnToggle.addEventListener("click", () => {
                row.visible = !row.visible;
                rebuildCustomerRowsList(true);
                renderCustomerRowsPreview();
                triggerAutosave();
            });
            
            // Clone button
            const btnClone = document.createElement("button");
            btnClone.type = "button";
            btnClone.className = "vmax-quote-btn-icon-secondary";
            btnClone.title = "Nhân bản hàng";
            btnClone.innerHTML = '<i class="fas fa-copy"></i>';
            btnClone.addEventListener("click", () => {
                duplicateCustomerRow(index);
            });
            
            // Delete button
            const btnDelete = document.createElement("button");
            btnDelete.type = "button";
            btnDelete.className = "vmax-quote-btn-icon-danger";
            btnDelete.title = "Xóa hàng";
            btnDelete.innerHTML = '<i class="fas fa-trash-alt"></i>';
            btnDelete.addEventListener("click", () => {
                deleteCustomerRow(index);
            });
            
            actions.appendChild(btnToggle);
            actions.appendChild(btnClone);
            actions.appendChild(btnDelete);
            
            card.appendChild(dragHandle);
            card.appendChild(inputsWrap);
            card.appendChild(actions);
            listContainer.appendChild(card);
        } else {
            const card = listContainer.children[index];
            if (card) {
                card.dataset.tempIdx = index;
            }
        }
    });
    
    if (fullRebuild) {
        initCustomerSortable();
    }
}

/**
 * Vẽ bảng khách hàng động lên trang A4
 */
function renderCustomerRowsPreview() {
    const table = document.querySelector(".vmax-quote-page-customer-table");
    if (!table) return;
    
    table.innerHTML = "";
    
    const isDirectEditChecked = document.getElementById("vmax-quote-page-print").classList.contains("vmax-quote-editable-active");
    
    quoteData.customerRows.forEach((row) => {
        if (row.visible) {
            const tr = document.createElement("tr");
            
            const labelTd = document.createElement("td");
            labelTd.className = "vmax-quote-cust-label";
            labelTd.textContent = row.label;
            
            const valTd = document.createElement("td");
            valTd.className = "vmax-quote-cust-val";
            valTd.id = `p-cust-row-${row.id}`;
            valTd.textContent = row.value || "................................................";
            
            if (isDirectEditChecked) {
                valTd.setAttribute("contenteditable", "true");
                valTd.addEventListener("blur", (e) => {
                    const newVal = e.target.innerText.trim();
                    row.value = newVal === "................................................" ? "" : newVal;
                    
                    // Cập nhật lại input ở sidebar
                    const list = document.getElementById("vmax-quote-customer-rows-list");
                    if (list) {
                        const valInputs = list.querySelectorAll(".row-value-input");
                        valInputs.forEach(input => {
                            const parentCard = input.closest(".vmax-quote-customer-row-card");
                            if (parentCard) {
                                const idx = parseInt(parentCard.dataset.tempIdx);
                                if (quoteData.customerRows[idx] && quoteData.customerRows[idx].id === row.id) {
                                    input.value = row.value;
                                }
                            }
                        });
                    }
                    
                    triggerAutosave();
                });
            }
            
            tr.appendChild(labelTd);
            tr.appendChild(valTd);
            table.appendChild(tr);
        }
    });
}

/**
 * Thêm một dòng thông tin khách hàng mới
 */
function addNewCustomerRow() {
    const newId = "cust-row-" + Date.now();
    quoteData.customerRows.push({
        id: newId,
        label: "Trường mới:",
        value: "",
        visible: true
    });
    rebuildCustomerRowsList(true);
    renderCustomerRowsPreview();
    triggerAutosave();
    
    // Tự động cuộn đến dòng vừa thêm ở sidebar
    const list = document.getElementById("vmax-quote-customer-rows-list");
    if (list && list.lastElementChild) {
        setTimeout(() => {
            list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

/**
 * Nhân bản dòng khách hàng
 */
function duplicateCustomerRow(index) {
    const origin = quoteData.customerRows[index];
    const newRow = {
        id: "cust-row-" + Date.now(),
        label: origin.label,
        value: origin.value,
        visible: origin.visible
    };
    quoteData.customerRows.splice(index + 1, 0, newRow);
    rebuildCustomerRowsList(true);
    renderCustomerRowsPreview();
    triggerAutosave();
}

/**
 * Xóa dòng khách hàng có hoàn tác
 */
async function deleteCustomerRow(index) {
    if (quoteData.customerRows.length <= 1) {
        showToast("Bạn cần giữ lại ít nhất một trường thông tin khách hàng!", "warning");
        return;
    }

    const confirmDelete = await showConfirmModal(
        "Xác nhận xóa trường thông tin",
        `Bạn có chắc chắn muốn xóa trường "${quoteData.customerRows[index].label}" không?`
    );
    
    if (confirmDelete) {
        const deletedRow = quoteData.customerRows[index];
        const backupRows = JSON.parse(JSON.stringify(quoteData.customerRows));
        
        quoteData.customerRows.splice(index, 1);
        rebuildCustomerRowsList(true);
        renderCustomerRowsPreview();
        triggerAutosave();
        
        showUndoToast(`Đã xóa trường "${deletedRow.label || 'Chưa đặt tên'}"`, () => {
            quoteData.customerRows = backupRows;
            rebuildCustomerRowsList(true);
            renderCustomerRowsPreview();
            triggerAutosave();
            showToast("Đã khôi phục trường thông tin thành công!");
        });
    }
}

/**
 * Hiển thị Toast hoàn tác (Undo Toast)
 */
let undoTimeout = null;
function showUndoToast(message, restoreCallback) {
    const existing = document.getElementById("vmax-quote-undo-toast");
    if (existing) {
        existing.remove();
    }
    if (undoTimeout) {
        clearTimeout(undoTimeout);
    }
    
    const toast = document.createElement("div");
    toast.id = "vmax-quote-undo-toast";
    toast.className = "vmax-quote-toast-undo-container";
    toast.innerHTML = `
        <div class="vmax-quote-toast-undo-content">
            <span>${message}</span>
            <button type="button" class="vmax-quote-toast-undo-btn" id="vmax-quote-btn-undo-action">
                <i class="fas fa-undo"></i> Hoàn tác
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("vmax-quote-toast-show");
    }, 10);
    
    document.getElementById("vmax-quote-btn-undo-action").addEventListener("click", () => {
        if (restoreCallback) {
            restoreCallback();
        }
        toast.classList.remove("vmax-quote-toast-show");
        setTimeout(() => toast.remove(), 300);
        if (undoTimeout) clearTimeout(undoTimeout);
    });
    
    undoTimeout = setTimeout(() => {
        toast.classList.remove("vmax-quote-toast-show");
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// --- HỖ TRỢ ELECTRON & SAO LƯU CẤU HÌNH ---

/**
 * Lấy URL ảnh logo công ty hiện tại (Ưu tiên: quoteData.company.logoUrl / logo -> DOM A4 logo img -> Fallback assets/logo-vmax.png)
 */
function getCompanyLogoUrl() {
    if (typeof quoteData !== "undefined" && quoteData && quoteData.company) {
        if (quoteData.company.logoUrl && quoteData.company.logoUrl.trim() !== "") {
            return quoteData.company.logoUrl;
        }
        if (quoteData.company.logo && quoteData.company.logo.trim() !== "") {
            return quoteData.company.logo;
        }
    }
    const domLogo = document.querySelector(".vmax-quote-page-header-logo-container img, #vmax-quote-page-logo-preview");
    if (domLogo && domLogo.src && !domLogo.src.endsWith("#") && domLogo.src !== window.location.href) {
        return domLogo.src;
    }
    return "assets/logo-vmax.png";
}

/**
 * Đợi cho toàn bộ ảnh trong bản in và trang PDF động tải xong
 */
function waitForImages() {
    const images = Array.from(document.querySelectorAll('#vmax-quote-page-print img, #vmax-quote-pdf-document img'));
    const promises = images.map(img => {
        if (!img.src || img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
        });
    });
    return Promise.all(promises);
}

/**
 * Đợi cho toàn bộ tài nguyên (font chữ và hình ảnh) tải xong trước khi phân trang / xuất PDF
 */
async function waitForAssetsReady() {
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }
    await waitForImages();
}

/**
 * Mở cơ sở dữ liệu IndexedDB của ứng dụng (Phiên bản 2)
 */
function openVmaxDB() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("vmax_quote_db", 2);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("assets")) {
                db.createObjectStore("assets");
            }
            if (!db.objectStoreNames.contains("templates")) {
                db.createObjectStore("templates");
            }
            if (!db.objectStoreNames.contains("customers")) {
                db.createObjectStore("customers", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("services")) {
                db.createObjectStore("services", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("quotations")) {
                db.createObjectStore("quotations", { keyPath: "id" });
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Chuyển đổi Blob thành chuỗi dữ liệu Base64
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Tuần tự hóa đệ quy đối tượng để chuyển đổi các thuộc tính Blob thành định dạng JSON được
 */
async function serializeValue(value) {
    if (value instanceof Blob) {
        const base64Data = await blobToBase64(value);
        return {
            _type: 'Blob',
            mimeType: value.type,
            data: base64Data
        };
    }
    if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
            const res = [];
            for (const item of value) {
                res.push(await serializeValue(item));
            }
            return res;
        } else {
            const res = {};
            for (const [key, val] of Object.entries(value)) {
                res[key] = await serializeValue(val);
            }
            return res;
        }
    }
    return value;
}

/**
 * Chuyển đổi chuỗi dữ liệu Base64 ngược lại thành Blob ban đầu
 */
function base64ToBlob(base64Data, mimeType) {
    const byteString = atob(base64Data.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
}

/**
 * Giải tuần tự hóa đệ quy đối tượng từ JSON để phục hồi lại các đối tượng Blob
 */
async function deserializeValue(value) {
    if (value && typeof value === 'object') {
        if (value._type === 'Blob') {
            return base64ToBlob(value.data, value.mimeType);
        }
        if (Array.isArray(value)) {
            const res = [];
            for (const item of value) {
                res.push(await deserializeValue(item));
            }
            return res;
        } else {
            const res = {};
            for (const [key, val] of Object.entries(value)) {
                res[key] = await deserializeValue(val);
            }
            return res;
        }
    }
    return value;
}

/**
 * Trích xuất toàn bộ dữ liệu IndexedDB bao gồm các store assets và templates
 */
async function exportIndexedDB() {
    try {
        const db = await openVmaxDB();
        const dbBackup = {
            dbName: "vmax_quote_db",
            stores: {}
        };
        
        const storeNames = ["assets", "templates"];
        for (const storeName of storeNames) {
            dbBackup.stores[storeName] = await new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, "readonly");
                const store = transaction.objectStore(storeName);
                const request = store.openCursor();
                const records = [];
                
                request.onsuccess = async (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const key = cursor.key;
                        const value = cursor.value;
                        const serializedVal = await serializeValue(value);
                        records.push({ key, value: serializedVal });
                        cursor.continue();
                    } else {
                        resolve(records);
                    }
                };
                request.onerror = (e) => reject(e.target.error);
            });
        }
        db.close();
        return dbBackup;
    } catch (err) {
        console.error("Failed to export IndexedDB:", err);
        return null;
    }
}

/**
 * Khôi phục cơ sở dữ liệu IndexedDB bằng một transaction duy nhất đảm bảo Rollback hoàn toàn nếu lỗi
 */
async function importIndexedDB(dbBackup) {
    if (!dbBackup || dbBackup.dbName !== "vmax_quote_db") {
        return;
    }

    // 1. Giải tuần tự hóa dữ liệu trước để tránh tác vụ bất đồng bộ kéo dài transaction
    const deserializedStores = {};
    const storeNames = ["assets", "templates"];
    for (const storeName of storeNames) {
        deserializedStores[storeName] = [];
        const records = dbBackup.stores[storeName] || [];
        for (const record of records) {
            const deserializedVal = await deserializeValue(record.value);
            deserializedStores[storeName].push({ key: record.key, value: deserializedVal });
        }
    }

    // 2. Mở kết nối và thực hiện transaction đồng thời trên cả hai store
    const db = await openVmaxDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["assets", "templates"], "readwrite");
        
        transaction.oncomplete = () => {
            db.close();
            resolve();
        };
        
        transaction.onerror = (event) => {
            db.close();
            reject(transaction.error || event.target.error);
        };
        
        transaction.onabort = () => {
            db.close();
            reject(new Error("IndexedDB transaction was aborted."));
        };
        
        try {
            for (const storeName of storeNames) {
                const store = transaction.objectStore(storeName);
                
                // Xóa sạch dữ liệu cũ
                store.clear();
                
                // Ghi dữ liệu mới vào store
                const records = deserializedStores[storeName];
                for (const record of records) {
                    store.put(record.value, record.key);
                }
            }
        } catch (err) {
            transaction.abort();
            reject(err);
        }
    });
}

/**
 * Tạo file sao lưu toàn bộ cấu hình (LocalStorage & IndexedDB) dưới định dạng JSON
 */
async function backupData() {
    if (!window.electronAPI) {
        showToast("Tính năng này chỉ hoạt động trên ứng dụng Desktop.", "warning");
        return;
    }
    
    try {
        const templateDrafts = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("vmax_quote_draft_")) {
                const templateId = decodeURIComponent(key.substring(17));
                try {
                    templateDrafts[templateId] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    console.error("Failed to parse backup draft key:", key, e);
                }
            }
        }
        
        const indexedDBData = await exportIndexedDB();
        const backupObj = {
            format: "vmax-quotation-backup",
            schemaVersion: 2,
            appVersion: "1.0.0",
            exportedAt: new Date().toISOString(),
            quoteData: quoteData,
            templateDrafts: templateDrafts,
            indexedDB: indexedDBData
        };
        
        const rawJson = JSON.stringify(backupObj);
        
        // Kiểm tra kích thước ở Renderer trước khi truyền IPC
        if (rawJson.length > 50 * 1024 * 1024) {
            showToast("Kích thước dữ liệu vượt quá giới hạn cho phép (50MB).", "danger");
            return;
        }
        
        const result = await window.electronAPI.saveBackup(rawJson);
        if (result.success) {
            showToast("Sao lưu dữ liệu cấu hình thành công!");
        } else if (result.error !== 'Cancelled') {
            showToast("Lỗi sao lưu: " + result.error, "danger");
        }
    } catch (err) {
        console.error("Backup failed:", err);
        showToast("Gặp sự cố khi sao lưu: " + err.message, "danger");
    }
}

/**
 * Đọc file JSON và thực hiện khôi phục dữ liệu, hỗ trợ transaction rollback nếu IndexedDB lỗi
 */
async function restoreData() {
    if (!window.electronAPI) {
        showToast("Tính năng này chỉ hoạt động trên ứng dụng Desktop.", "warning");
        return;
    }
    
    try {
        const result = await window.electronAPI.loadBackup();
        if (!result.success) {
            if (result.error !== 'Cancelled') {
                showToast("Lỗi tải cấu hình: " + result.error, "danger");
            }
            return;
        }
        
        const parsed = result.data;
        
        // 1. Kiểm tra định dạng và tính tương thích
        if (parsed.format !== "vmax-quotation-backup") {
            showToast("Định dạng file sao lưu không hợp lệ.", "danger");
            return;
        }
        
        if (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) {
            showToast(`Phiên bản schema ${parsed.schemaVersion} không tương thích với phiên bản hiện tại (1 hoặc 2).`, "danger");
            return;
        }
        
        if (parsed.appVersion !== "1.0.0") {
            console.warn(`Phiên bản ứng dụng khác biệt: ${parsed.appVersion} (phiên bản hiện tại: 1.0.0)`);
        }
        
        const confirmReplace = confirm("Bạn có chắc chắn muốn khôi phục dữ liệu từ tệp này không? Toàn bộ dữ liệu hiện tại sẽ bị thay thế.");
        if (!confirmReplace) return;
        
        // 2. Khôi phục IndexedDB trước (nếu lỗi sẽ tự động rollback nhờ transaction duy nhất)
        if (parsed.indexedDB) {
            try {
                await importIndexedDB(parsed.indexedDB);
            } catch (dbErr) {
                showToast("Khôi phục cơ sở dữ liệu thất bại. Các thay đổi đã được hủy để bảo vệ dữ liệu cũ.", "danger");
                console.error("IndexedDB restore failed, rolled back:", dbErr);
                return; // Ngăn cản ghi đè LocalStorage
            }
        }
        
        // 3. Khôi phục LocalStorage chỉ khi IndexedDB đã khôi phục thành công
        if (parsed.quoteData) {
            quoteData = parsed.quoteData;
            const activeTemplate = quoteData.activeTemplate || "preset-web";
            localStorage.setItem(getTemplateDraftKey(activeTemplate), JSON.stringify(quoteData));
            
            // Xóa các bản nháp cũ trong localStorage trước khi khôi phục
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith("vmax_quote_draft_")) {
                    localStorage.removeItem(key);
                }
            }
            
            // Khôi phục các bản nháp mẫu báo giá mới
            if (parsed.templateDrafts) {
                Object.keys(parsed.templateDrafts).forEach(templateId => {
                    const draftVal = parsed.templateDrafts[templateId];
                    localStorage.setItem(getTemplateDraftKey(templateId), JSON.stringify(draftVal));
                });
            }
            
            // Khởi tạo lại giao diện ứng dụng từ dữ liệu mới
            initApp();
            showToast("Khôi phục dữ liệu cấu hình thành công!");
        }
    } catch (err) {
        console.error("Restore failed:", err);
        showToast("Lỗi khi khôi phục dữ liệu: " + err.message, "danger");
    }
}



async function initTemplateManager() {
    const select = document.getElementById("vmax-quote-template-select");
    const loadContentBtn = document.getElementById("vmax-quote-btn-load-template-content");
    const saveBtn = document.getElementById("vmax-quote-btn-save-template");
    const deleteBtn = document.getElementById("vmax-quote-btn-delete-template");
    
    if (!select || !saveBtn || !deleteBtn) return;
    
    await refreshTemplateSelect();
    
    // Đồng bộ lại giá trị mẫu hoạt động trên giao diện khi tải trang
    if (quoteData && quoteData.activeTemplate) {
        select.value = quoteData.activeTemplate;
        if (loadContentBtn) {
            loadContentBtn.style.display = quoteData.activeTemplate ? "inline-flex" : "none";
        }
        if (quoteData.activeTemplate.startsWith("custom-")) {
            deleteBtn.style.display = "inline-block";
        }
    }
    
    // 1. KHI ĐỔI MẪU TRÊN DROPDOWN: TỰ ĐỘNG LƯU BẢN NHÁP MẪU CŨ VÀ NẠP BẢN NHÁP/QUOTEDATA ĐỘC LẬP CỦA MẪU MỚI
    select.addEventListener("change", async (e) => {
        const nextTemplate = e.target.value;
        const previousTemplate = quoteData.activeTemplate || 'preset-web';
        
        if (!nextTemplate || nextTemplate === previousTemplate) return;

        logQuoteState("SWITCH 1. Trước khi lưu mẫu cũ", previousTemplate, getTemplateDraftKey(previousTemplate), "State mẫu cũ trước khi lưu");

        // LUỒNG CHUYỂN MẪU BẮT BUỘC
        // 1. Lưu oldTemplateId
        const oldTemplateId = previousTemplate;

        // 2. Đồng bộ form hiện tại vào state của mẫu cũ
        updateQuoteData();

        // Lưu snapshot vào stack Undo riêng của mẫu cũ
        pushUndoState();

        // 3. Lưu state vào key riêng của oldTemplateId
        if (oldTemplateId) {
            localStorage.setItem(getTemplateDraftKey(oldTemplateId), JSON.stringify(quoteData));
        }

        logQuoteState("SWITCH 2. Sau khi lưu mẫu cũ", oldTemplateId, getTemplateDraftKey(oldTemplateId), "Mẫu cũ đã ghi vào localStorage");

        // 4. Đọc bản nháp theo newTemplateId (nextTemplate)
        const nextDraftKey = getTemplateDraftKey(nextTemplate);
        logQuoteState("SWITCH 3. Trước khi tải mẫu mới", nextTemplate, nextDraftKey, "Chuẩn bị đọc localStorage");
        const savedNextDraftRaw = localStorage.getItem(nextDraftKey);
        
        let newQuoteData = null;
        if (savedNextDraftRaw) {
            try {
                const parsedDraft = JSON.parse(savedNextDraftRaw);
                const defaultForTemplate = loadDefaultTemplateData(nextTemplate);
                newQuoteData = mergeDeep({}, defaultForTemplate, parsedDraft);
                logQuoteState("SWITCH 4a. Đã parse JSON mẫu mới", nextTemplate, nextDraftKey, "JSON.parse(savedNextDraftRaw)");
            } catch (err) {
                console.error("Lỗi đọc bản nháp mẫu mới:", err);
                newQuoteData = loadDefaultTemplateData(nextTemplate);
                logQuoteState("SWITCH 4b. Catch lỗi nạp default mẫu mới", nextTemplate, nextDraftKey, "loadDefaultTemplateData");
            }
        } else {
            // 5. Nếu chưa có bản nháp, clone dữ liệu mặc định của đúng mẫu mới
            newQuoteData = loadDefaultTemplateData(nextTemplate);
            logQuoteState("SWITCH 4c. Không có nháp - nạp default mẫu mới", nextTemplate, nextDraftKey, "loadDefaultTemplateData");
        }

        // Bổ sung cơ chế migration/fallback nếu dữ liệu nháp cũ bị lỗi/thiếu trường items (không đè khi người dùng xóa)
        const isCorruptedOrMissing = (!newQuoteData._initialized && (!newQuoteData.items || newQuoteData.items.length === 0)) || newQuoteData.items === undefined || newQuoteData.items === null;

        if (isCorruptedOrMissing && !newQuoteData._userClearedItems) {
            const defaultItems = PRESET_TEMPLATES[nextTemplate]?.items || DEFAULT_QUOTE_DATA.items;
            newQuoteData.items = JSON.parse(JSON.stringify(defaultItems));
            newQuoteData._initialized = true;
            newQuoteData._userClearedItems = false;
            logQuoteState("SWITCH 5c. Khôi phục items từ fallback", nextTemplate, nextDraftKey, "Fallback items triggered");
        } else {
            newQuoteData._initialized = true;
            logQuoteState("SWITCH 5d. Giữ nguyên items mẫu mới sau khi tải", nextTemplate, nextDraftKey, "State items giữ nguyên");
        }

        if (newQuoteData.items && Array.isArray(newQuoteData.items)) {
            newQuoteData.items.forEach(item => {
                if (!item.cells) {
                    item.cells = {};
                    item.cells["col-title"] = item.title || "";
                    item.cells["col-desc"] = item.description || "";
                    item.cells["col-price"] = "";
                }
            });
        }

        // 6. Sau cùng mới cập nhật activeTemplate = newTemplateId
        newQuoteData.activeTemplate = nextTemplate;
        quoteData = JSON.parse(JSON.stringify(newQuoteData)); // Clone sâu hoàn toàn độc lập
        localStorage.setItem("vmax_quote_active_template", nextTemplate);
        
        updateUndoRedoUI();

        logQuoteState("SWITCH 6. Trước khi render UI mẫu mới", nextTemplate, nextDraftKey, "Trạng thái sẵn sàng render UI");

        // 7. Render lại Sidebar, form, tính tiền và bản xem trước A4
        rebuildItemsSidebarList(true);
        fillFormFromData();
        calculatePricing();
        renderPreview();

        if (loadContentBtn) loadContentBtn.style.display = "inline-flex";
        if (deleteBtn) deleteBtn.style.display = nextTemplate.startsWith("custom-") ? "inline-block" : "none";

        saveDraft(false);
        const templateLabel = nextTemplate === 'preset-seo' ? 'Dịch vụ SEO tổng thể' : (nextTemplate === 'preset-web' ? 'Thiết kế Website' : 'mẫu mới');
        showToast(`Đã chuyển sang Mẫu: ${templateLabel}! (Bản nháp độc lập)`);
    });

    // 2. CHỨC NĂNG "NẠP NỘI DUNG MẪU": CHỈ NẠP DỮ LIỆU KHI NGƯỜI DÙNG BẤM NÚT VÀ XÁC NHẬN
    if (loadContentBtn) {
        loadContentBtn.addEventListener("click", async () => {
            const currentTemplate = select.value || quoteData.activeTemplate;
            if (!currentTemplate) {
                showToast("Vui lòng chọn một mẫu báo giá từ danh sách!", "warning");
                return;
            }

            const confirmed = await showConfirmModal(
                "Nạp nội dung mẫu",
                "Bạn có chắc chắn muốn nạp nội dung (hạng mục công việc, giá và điều khoản) từ mẫu này không? Dữ liệu công ty, thông tin khách hàng và chữ ký vẫn được giữ nguyên."
            );

            if (!confirmed) return;

            // Lưu Undo state trước khi nạp nội dung
            pushUndoState();
            updateQuoteData();

            // Bảo tồn thông tin công ty, khách hàng, chữ ký và mã báo giá
            const preservedCompany = JSON.parse(JSON.stringify(quoteData.company || {}));
            const preservedCustomer = JSON.parse(JSON.stringify(quoteData.customer || {}));
            const preservedMeta = {
                code: quoteData.quotation?.code || "",
                staff: quoteData.quotation?.staff || "",
                date: quoteData.quotation?.date || "",
                dueDate: quoteData.quotation?.dueDate || ""
            };
            const preservedSignatures = {
                signatureCustImgUrl: quoteData.timeline?.signatureCustImgUrl || "",
                signatureCompImgUrl: quoteData.timeline?.signatureCompImgUrl || ""
            };

            let templateData = null;
            if (currentTemplate.startsWith("preset-")) {
                templateData = PRESET_TEMPLATES[currentTemplate];
            } else if (currentTemplate.startsWith("custom-")) {
                const templateName = currentTemplate.substring(7);
                try {
                    const dbInstance = await openVmaxDB();
                    const transaction = dbInstance.transaction(["templates"], "readonly");
                    const store = transaction.objectStore("templates");
                    const request = store.get(templateName);
                    templateData = await new Promise((resolve) => {
                        request.onsuccess = () => resolve(request.result || null);
                        request.onerror = () => resolve(null);
                    });
                } catch (err) {
                    console.error("Lỗi khi tải mẫu tùy chỉnh:", err);
                }
            }

            if (templateData) {
                const cloned = JSON.parse(JSON.stringify(templateData));
                if (cloned.items) quoteData.items = cloned.items;
                if (cloned.quotation) {
                    quoteData.quotation.title = cloned.quotation.title || quoteData.quotation.title;
                    quoteData.quotation.desc = cloned.quotation.desc || quoteData.quotation.desc;
                }
                if (cloned.pricing) {
                    quoteData.pricing = mergeDeep({}, quoteData.pricing, cloned.pricing);
                }
                if (cloned.timeline) {
                    quoteData.timeline = mergeDeep({}, quoteData.timeline, cloned.timeline);
                }

                // Gắn lại thông tin bảo tồn
                quoteData.company = preservedCompany;
                quoteData.customer = mergeDeep({}, preservedCustomer, {
                    serviceName: cloned.customer?.serviceName || preservedCustomer.serviceName || ""
                });
                quoteData.quotation.code = preservedMeta.code || quoteData.quotation.code;
                quoteData.quotation.staff = preservedMeta.staff || quoteData.quotation.staff;
                quoteData.quotation.date = preservedMeta.date || quoteData.quotation.date;
                quoteData.quotation.dueDate = preservedMeta.dueDate || quoteData.quotation.dueDate;

                if (!quoteData.timeline) quoteData.timeline = {};
                quoteData.timeline.signatureCustImgUrl = preservedSignatures.signatureCustImgUrl;
                quoteData.timeline.signatureCompImgUrl = preservedSignatures.signatureCompImgUrl;
                
                quoteData._initialized = true;
                quoteData._userClearedItems = false;
            }

            rebuildItemsSidebarList(true);
            fillFormFromData();
            calculatePricing();
            renderPreview();
            saveDraft(false);
            showToast("Đã nạp nội dung mẫu báo giá thành công!");
        });
    }
    
    saveBtn.addEventListener("click", async () => {
        const name = prompt("Nhập tên cho mẫu báo giá mới (Ví dụ: Web Bán Hàng cao cấp, SEO Bất Động Sản):");
        if (!name || !name.trim()) return;
        
        const templateName = name.trim();
        if (PRESET_TEMPLATES["preset-" + templateName] || templateName.toLowerCase().startsWith("preset-")) {
            alert("Tên mẫu trùng với mẫu hệ thống. Vui lòng chọn tên khác!");
            return;
        }
        
        try {
            const dbInstance = await openVmaxDB();
            const transaction = dbInstance.transaction(["templates"], "readwrite");
            const store = transaction.objectStore("templates");
            
            const dataToSave = JSON.parse(JSON.stringify(quoteData));
            
            const request = store.put(dataToSave, templateName);
            request.onsuccess = async () => {
                showToast(`Đã lưu mẫu báo giá "${templateName}" thành công!`);
                await refreshTemplateSelect();
                select.value = "custom-" + templateName;
                deleteBtn.style.display = "inline-block";
                
                quoteData.activeTemplate = "custom-" + templateName;
                saveDraft(false);
            };
        } catch (err) {
            console.error("Error saving template:", err);
            showToast("Lỗi khi lưu mẫu báo giá!", "danger");
        }
    });
    
    deleteBtn.addEventListener("click", async () => {
        const val = select.value;
        if (!val || !val.startsWith("custom-")) return;
        
        const templateName = val.substring(7);
        if (confirm(`Bạn có chắc chắn muốn xóa mẫu báo giá "${templateName}"?`)) {
            try {
                const dbInstance = await openVmaxDB();
                const transaction = dbInstance.transaction(["templates"], "readwrite");
                const store = transaction.objectStore("templates");
                
                const request = store.delete(templateName);
                request.onsuccess = async () => {
                    showToast(`Đã xóa mẫu báo giá "${templateName}"!`);
                    await refreshTemplateSelect();
                    select.value = "";
                    deleteBtn.style.display = "none";
                };
            } catch (err) {
                console.error("Error deleting template:", err);
                showToast("Lỗi khi xóa mẫu báo giá!", "danger");
            }
        }
    });
}

async function refreshTemplateSelect() {
    const select = document.getElementById("vmax-quote-template-select");
    if (!select) return;
    
    select.innerHTML = `
        <option value="preset-web">Mẫu: Thiết kế Website chuyên nghiệp (Mặc định)</option>
        <option value="preset-seo">Mẫu: Dịch vụ SEO tổng thể</option>
    `;
    
    try {
        const dbInstance = await openVmaxDB();
        const transaction = dbInstance.transaction(["templates"], "readonly");
        const store = transaction.objectStore("templates");
        const request = store.getAllKeys();
        
        return new Promise((resolve) => {
            request.onsuccess = () => {
                const keys = request.result;
                keys.forEach(key => {
                    const option = document.createElement("option");
                    option.value = "custom-" + key;
                    option.textContent = "Mẫu riêng: " + key;
                    select.appendChild(option);
                });
                resolve();
            };
            request.onerror = () => resolve();
        });
    } catch (err) {
        console.error("Error loading template list:", err);
    }
}

