import { runTableRenames, seedInitialData } from './seeder';
import * as serverDefaults from '../../serverDefaults';

export async function setupDatabaseSchema(connection: any, database: string) {
  // web_menu_items is now preserved and used for clean homepage representation.

  // 1. Run Legacy Table Reroutes (haste_ to web_)
  await runTableRenames(connection, database);

  // 2. Clear & Create Web Schema Tables
  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_membership_users (
      id SERIAL PRIMARY KEY,
      store_name VARCHAR(255) NOT NULL,
      store_code VARCHAR(100) NULL,
      owner_name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      address VARCHAR(500) NULL,
      content TEXT NULL,
      approval_status VARCHAR(50) DEFAULT '요청',
      store_type VARCHAR(50) DEFAULT '일반',
      business_number VARCHAR(100) NULL,
      business_cert_path VARCHAR(500) NULL,
      signup_path VARCHAR(255) DEFAULT '맴버십가입신청',
      password VARCHAR(255) NULL,
      role VARCHAR(50) DEFAULT 'USER',
      agreement_document_url VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_membership_consultations (
      id SERIAL PRIMARY KEY,
      region_name VARCHAR(255) NOT NULL,
      owner_name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      capital VARCHAR(255) NULL,
      has_store VARCHAR(50) DEFAULT '없음',
      inquiry_path VARCHAR(255) NULL,
      signup_path VARCHAR(255) DEFAULT '창업문의',
      content TEXT NULL,
      approval_status VARCHAR(50) DEFAULT '요청',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_board_posts (
      id SERIAL PRIMARY KEY,
      member_id INT NOT NULL,
      writer_name VARCHAR(255) NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'Q&A',
      skin_type INT DEFAULT 1,
      is_secret BOOLEAN DEFAULT FALSE,
      is_notice BOOLEAN DEFAULT FALSE,
      view_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await connection.query('ALTER TABLE web_board_posts ADD COLUMN writer_name VARCHAR(255) NULL');
  } catch (err) {
    // Ignore error if column already exists
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_board_attachments (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size BIGINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_board_comments (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL,
      member_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_admin_accounts (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_home_main (
      id SERIAL PRIMARY KEY,
      tag VARCHAR(255) NOT NULL,
      slogan VARCHAR(255) NOT NULL,
      subtext VARCHAR(255) NOT NULL,
      bg_image TEXT NOT NULL,
      description TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      default_tag VARCHAR(255) NULL,
      default_slogan VARCHAR(255) NULL,
      default_subtext VARCHAR(255) NULL,
      default_bg_image TEXT NULL,
      default_description TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_interior_layouts (
      id SERIAL PRIMARY KEY,
      type_id VARCHAR(50) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) NOT NULL,
      "desc" TEXT NOT NULL,
      tags TEXT NOT NULL,
      highlights TEXT NOT NULL,
      gallery TEXT NOT NULL,
      video_links TEXT NULL,
      mock_image TEXT NOT NULL,
      blueprint_image TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      default_title VARCHAR(255) NULL,
      default_subtitle VARCHAR(255) NULL,
      default_desc TEXT NULL,
      default_tags TEXT NULL,
      default_highlights TEXT NULL,
      default_gallery TEXT NULL,
      default_video_links TEXT NULL,
      default_mock_image TEXT NULL,
      default_blueprint_image TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_menu_categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      "desc" TEXT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_brand_films (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      "desc" TEXT NOT NULL,
      video_url TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      category VARCHAR(50) DEFAULT 'THEATER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_brand_sounds (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      "desc" TEXT NOT NULL,
      sound_url TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_store_licenses (
      id SERIAL PRIMARY KEY,
      store_name VARCHAR(255) NOT NULL,
      store_id VARCHAR(100) NOT NULL UNIQUE,
      license_start_date DATE NOT NULL,
      license_end_date DATE NOT NULL,
      is_approved BOOLEAN DEFAULT TRUE,
      store_grade VARCHAR(50) DEFAULT 'PREMIUM',
      password VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_verify_logs (
      id SERIAL PRIMARY KEY,
      store_id VARCHAR(100) NOT NULL,
      ip VARCHAR(50) NOT NULL,
      is_approved BOOLEAN NOT NULL,
      status_type VARCHAR(10) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_grade_permissions (
      id SERIAL PRIMARY KEY,
      grade_type VARCHAR(50) NOT NULL,
      category_key VARCHAR(100) NOT NULL,
      can_read INT DEFAULT 1,
      can_write INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_grade_category UNIQUE (grade_type, category_key)
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_songs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NULL,
      "desc" TEXT NULL,
      genre VARCHAR(100) NULL,
      mood VARCHAR(100) NULL,
      sound_url TEXT NOT NULL,
      cover_url TEXT NULL,
      lyrics TEXT NULL,
      visible BOOLEAN DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      owner_pick BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_covers (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      "desc" TEXT NULL,
      video_url TEXT NOT NULL,
      weather VARCHAR(100) NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_playlists (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      "desc" TEXT NULL,
      cover_url TEXT NULL,
      mood_tags TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_comments (
      id SERIAL PRIMARY KEY,
      song_id INT NOT NULL,
      store_name VARCHAR(255) NOT NULL,
      owner_name VARCHAR(255) NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_posts (
      id SERIAL PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      store_name VARCHAR(255) NOT NULL,
      owner_name VARCHAR(255) NOT NULL,
      likes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure fallback columns or updates exist
  try {
    await connection.query("ALTER TABLE web_membership_users ADD COLUMN agreement_document_url VARCHAR(500) NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_menu_items ADD COLUMN is_signature BOOLEAN NOT NULL DEFAULT FALSE");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_menu_items MODIFY COLUMN image TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_menu_items ADD COLUMN video_url TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_board_posts ADD COLUMN category VARCHAR(100) DEFAULT 'Q&A'");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_board_posts ADD COLUMN skin_type INT DEFAULT 1");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_store_licenses ADD COLUMN password VARCHAR(255) NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_brand_films ADD COLUMN category VARCHAR(50) DEFAULT 'THEATER'");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_interior_layouts ADD COLUMN video_links TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_interior_layouts ADD COLUMN default_video_links TEXT NULL");
  } catch (_) {}

  // 공식 홈페이지 오픈 공지글 본문에 MENU 안내 누락사항 복원 보정
  try {
    const announcementContent = `<p>안녕하십니까, 헤이스트(HASTE) 플랫폼 운영진입니다.</p>

<p>점주님들의 원활하고 독립적인 점포 운영을 지원할 공식 홈페이지와 점포 관리 시스템이 정식으로 오픈되었습니다. 이와 더불어, 전국 점주님들이 매장을 더욱 안전하고 효율적으로 가동하실 수 있도록 지난 4년간 축적된 헤이스트 고유의 장비 관리 노하우 및 실전 운영 팁들을 통합 매뉴얼로 엮어 전격 공개합니다.</p>

<p> 홈페이지 주요 메뉴 및 서비스 소개</p>

<p>- BRAND: 헤이스트의 브랜드 철학과 4대 자율권 가치 소개<br>
- INTERIOR: 매장 콘셉트별 완공 인테리어 시안 조회 및 가상 창업 계산기<br>
- MENU: 헤이스트 에스프레소 베리에이션 및 시그니처 음료 메뉴 소개<br>
- MEMBERSHIP: 점주 가입 신청, 라이선스 키 관리 및 커피머신 로컬서버 연동 결제<br>
- 매장안내 : 전국 협력 매장의 위치 및 상세 정보 지도 조회<br>
- 커뮤니티 : 운영팀 소식 및 점주 전용 실시간 Q&A 게시판 운영</p>

<p> [4개년 통합 매뉴얼] 노하우팁 카테고리 오픈</p>

<p>이번에 통합 공개된 운영 매뉴얼은 실제 매장을 가동하시는 현장 베테랑 점주님들의 생생한 기기 조작 팁부터, 커피머신 및 제빙기 등의 미세 오류 예방책, 동파 관리법, 그리고 수리비 부담 완화를 위한 자가 정비 요령까지 실무에 필요한 모든 정보를 체계적으로 수록하고 있습니다.</p>

<p>- 열람 방법: 홈페이지 상단 [커뮤니티] -> [노하우팁] 카테고리에서 언제든 자유롭게 열람 및 참고하실 수 있습니다.</p>

<p> 파트너 점주 가이드북 바로가기<br>
- 아래 링크를 클릭하시면 가입 절차 및 필수 세팅 조작 가이드를 팝업으로 빠르게 확인하실 수 있습니다.<br>
- [가이드북 팝업 열기]</p>

<p>헤이스트는 일방적인 통제가 아닌, 점주님들의 든든한 상생 파트너로서 늘 함께하겠습니다. 많은 활용과 관심을 부탁드립니다.</p>

<p>감사합니다.</p>`;
    await connection.query(
      "UPDATE web_board_posts SET content = ? WHERE id = 106 OR title LIKE '%공식 홈페이지 오픈%'",
      [announcementContent]
    );
  } catch (_) {}

  // 멤버십 가입 절차 공지글 본문에 비교표 추가 보정
  try {
    const benefitDetailContent = `<p>안녕하십니까, 헤이스트(HASTE) 운영팀입니다.</p>

<p>헤이스트 매장 솔루션 및 로컬 서버 프로그램의 원활한 이용을 위한 멤버십 가입 절차와 정기 구독 플랜별 혜택을 안내해 드립니다.</p>

<p>[멤버십 단계별 가입 절차]<br>
가입 신청서 작성부터 라이선스 키 발급까지의 상세한 4단계 과정은 아래 링크를 통해 가이드북 팝업창에서 바로 확인하실 수 있습니다.<br>
- [가이드북 팝업 열기]</p>

<p>헤이스트는 정형화된 프랜차이즈가 아니며, 사장님들과의 수평적인 상생 파트너십을 지향합니다.<br>
다만 두 멤버십 간에는 매장의 '손님 유치력과 순수익'을 결정짓는 혜택의 차이가 있습니다.<br>
사장님의 매장 운영 방향에 꼭 맞는 최적의 플랜을 선택해 보세요!</p>


<p>📢 일반 멤버십 vs 헤이스트 멤버십 혜택 비교</p>
<table style="width:100%; border-collapse:collapse; border:1px solid #E5E5E5; margin:15px 0; font-size:13px; text-align:left;">
  <thead>
    <tr style="background-color:#F9F9F9; border-bottom:2px solid #E5E5E5;">
      <th style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">구분</th>
      <th style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">일반 멤버십 (Membership)</th>
      <th style="padding:10px; font-weight:bold;">헤이스트 멤버십 (Haste Membership)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E5E5E5;">
      <td style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">운영 방식</td>
      <td style="padding:10px; border-right:1px solid #E5E5E5;">자체 브랜딩 운영<br>(솔루션 전산만 적용)</td>
      <td style="padding:10px;">헤이스트 브랜드 무상 사용<br>(로고 및 상표 전면 노출)</td>
    </tr>
    <tr style="border-bottom:1px solid #E5E5E5;">
      <td style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">공동구매</td>
      <td style="padding:10px; border-right:1px solid #E5E5E5;">미지원</td>
      <td style="padding:10px;">원부재료 도매가 대비<br>추가 할인 혜택 제공</td>
    </tr>
    <tr style="border-bottom:1px solid #E5E5E5;">
      <td style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">브랜드 소모품</td>
      <td style="padding:10px; border-right:1px solid #E5E5E5;">자체 조달</td>
      <td style="padding:10px;">헤이스트 전용 컵/컵홀더<br>디자인 무상 라이선스 제공</td>
    </tr>
    <tr style="border-bottom:1px solid #E5E5E5;">
      <td style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">브랜드 마케팅</td>
      <td style="padding:10px; border-right:1px solid #E5E5E5;">미지원</td>
      <td style="padding:10px;">AI 기반 매장 홍보 및<br>우수매장 자동 마케팅 지원</td>
    </tr>
    <tr style="border-bottom:1px solid #E5E5E5;">
      <td style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">레시피 기여 보상</td>
      <td style="padding:10px; border-right:1px solid #E5E5E5;">미지원</td>
      <td style="padding:10px;">우수 레시피 개발 기여 시<br>구독료 할인 및 보상</td>
    </tr>
    <tr style="border-bottom:1px solid #E5E5E5;">
      <td style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">전용 APP 연동</td>
      <td style="padding:10px; border-right:1px solid #E5E5E5;">미지원</td>
      <td style="padding:10px;">출시 예정 전용 어플 연동<br>(스마트 POS 및 포인트 적립)</td>
    </tr>
    <tr style="border-bottom:1px solid #E5E5E5;">
      <td style="padding:10px; border-right:1px solid #E5E5E5; font-weight:bold;">공통 혜택</td>
      <td style="padding:10px; border-right:1px solid #E5E5E5;">독립 경영 자율권 보장<br>월 구독 갱신 시스템<br>다점포 가입비 50% 감면<br>BGM 플레이리스트 무상 지원</td>
      <td style="padding:10px;">13대 핵심 솔루션 혜택<br>전부 무제한 제공</td>
    </tr>
  </tbody>
</table>

<p><strong>1. 헤이스트 멤버십 (HASTE PREMIUM) — [추천]</strong><br>
헤이스트의 브랜드 가치를 전면에 걸고, 총 13대 마스터 패키지 혜택을 제한 없이 온전히 누리는 최고 효율의 플랜입니다.</p>

<p>* 13대 프리미엄 인프라 제공<br>
- [혜택안내 팝업 열기]<br>
* [독점] 헤이스트 상표권 무상 사용 권한 부여 (HASTE 브랜드 전면 이용)<br>
* [독점] 브랜드 공통 마케팅 전개 (전사적 인지도 상승 및 손님 유입 지원)<br>
* [독점] 헤이스트 전용 어플 출시 예정 (스마트 POS, 원격 제어, 포인트 통합)<br>
* [독점] 원부재료 공동구매 추가 특가 할인 (제조사 직거래로 순수익 극대화)<br>
* [독점] 시그니처 레시피 공유 시 월 구독료 추가 감면 리워드<br>
* 시스템 유지보수 및 소프트웨어 정기 업데이트 (월 5만원)<br>
* 불시 현장 위생점검 등 규제 및 간섭 완전 차단 권리 보장<br>
* 의무 사입 제약 없는 완전한 자율 소싱 및 도매 물류망 연계<br>
* 매달 편리한 월 정기구독 갱신 시스템<br>
* 추가 매장 솔루션 도입 시 가입비 50% 즉시 면제<br>
* 점주 전용 실시간 커뮤니티 및 FAQ 가이드북 제공<br>
* 안정적인 관리 및 기능 업그레이드 지원<br>
* 저작권료 걱정 없는 매장 BGM 플레이리스트 제공</p>

<p><strong>2. 일반 멤버십 (SOLUTION ONLY)</strong><br>
헤이스트의 강력한 스마트 솔루션 기술력만 빌려 쓰고, 매장 상호와 인테리어는 사장님만의 개인 브랜드로 완벽하게 자율 운영하는 플랜입니다.</p>

<p>* 독자적인 개인 브랜드 가동 및 자율적 공간 연출<br>
헤이스트 브랜딩에 구애받지 않고, 원하는 상호와 인테리어 콘셉트로 자유롭게 매장을 꾸밀 수 있습니다.</p>

<p>* 8대 필수 기술 인프라 제공<br>
* 시스템 유지보수 및 소프트웨어 정기 업데이트 (월 5만원)<br>
* 불시 현장 위생점검 등 규제 및 간섭 완전 차단 권리 보장<br>
* 의무 사입 제약 없는 완전한 자율 소싱 및 도매 물류망 연계<br>
* 매달 편리한 월 정기구독 갱신 시스템<br>
* 추가 매장 솔루션 도입 시 가입비 50% 즉시 면제<br>
* 점주 전용 실시간 커뮤니티 및 FAQ 가이드북 제공<br>
* 안정적인 관리 및 기능 업그레이드 지원<br>
* 저작권료 걱정 없는 매장 BGM 플레이리스트 제공</p>

<p>협력 매장의 안정적이고 자율적인 운영을 위해 늘 함께하겠습니다.<br>
감사합니다.</p>`;
    await connection.query(
      "UPDATE web_board_posts SET content = ? WHERE id = 107 OR title LIKE '%멤버십 가입 절차%'",
      [benefitDetailContent]
    );
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE music_songs ADD COLUMN lyrics TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE music_songs ADD COLUMN visible BOOLEAN DEFAULT TRUE");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE music_songs ADD COLUMN order_index INT NOT NULL DEFAULT 0");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_board_posts ADD COLUMN is_notice BOOLEAN DEFAULT FALSE");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_board_posts ADD COLUMN like_count INT DEFAULT 0");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_grade_permissions ADD COLUMN can_list INT DEFAULT 1");
    // Migrate existing '일반' store types to '멤버십'
    await connection.query("UPDATE web_membership_users SET store_type = '멤버십' WHERE store_type = '일반'");
    await connection.query("UPDATE web_kakao_members SET store_type = '멤버십' WHERE store_type = '일반'");
    console.log('[Schema Setup] web_grade_permissions table checked and migrated.');
  } catch (_) {}

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_post_likes (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL,
      member_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_post_member_like UNIQUE (post_id, member_id)
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_system_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await connection.query(`ALTER TABLE web_system_settings ALTER COLUMN setting_value TYPE TEXT`);
  } catch (_) {}

  try {
    await connection.query(`
      INSERT INTO web_system_settings (setting_key, setting_value) 
      VALUES ('draft_random_show', 'false') 
      ON CONFLICT (setting_key) DO NOTHING
    `);
  } catch (_) {}

  try {
    const defaultVal = JSON.stringify({
      title: serverDefaults.AGREEMENT_TITLE,
      subtitle: serverDefaults.AGREEMENT_SUBTITLE,
      lines: serverDefaults.AGREEMENT_LINES,
      provider: {
        name: '주식회사 헤이스트 에이아이',
        bizNo: '(발급 후 기재)',
        ceo: '김성규',
        address: '(법인 등기부상 본점 주소)',
        phone: '1644-8999'
      }
    });
    await connection.query(`
      INSERT INTO web_system_settings (setting_key, setting_value) 
      VALUES ('agreement_config', ?) 
      ON CONFLICT (setting_key) DO NOTHING
    `, [defaultVal]);

    // Surgical migration of the 18th line if it contains the old 6/12 month text
    const [rows]: any = await connection.query("SELECT setting_value FROM web_system_settings WHERE setting_key = 'agreement_config' LIMIT 1");
    if (rows && rows.length > 0) {
      const val = rows[0].setting_value;
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      let lines = parsed.lines || [];
      let changed = false;
      lines = lines.map((l: string) => {
        if (l.includes('6개월 정기구독 유지 시 +7일') || l.includes('6개월은 +7일')) {
          changed = true;
          return '"을"이 월 이용료 정기구독 플랜을 유지하는 경우 매장 상태 및 결제 내역에 따라 추가적인 점주 혜택을 제공할 수 있다.';
        }
        return l;
      });
      // Also ensure parsed.provider exists
      if (!parsed.provider) {
        parsed.provider = {
          name: '주식회사 헤이스트 에이아이',
          bizNo: '(발급 후 기재)',
          ceo: '김성규',
          address: '(법인 등기부상 본점 주소)',
          phone: '1644-8999'
        };
        changed = true;
      }
      if (changed) {
        await connection.query("UPDATE web_system_settings SET setting_value = ? WHERE setting_key = 'agreement_config'", [JSON.stringify(parsed)]);
      }
    }
  } catch (err) {
    console.error('Failed to run migration/seeding for agreement config:', err);
  }

  // Surgical migration of Q&A post 117 content if it contains the old text
  try {
    await connection.query(
      "UPDATE web_board_posts SET content = ? WHERE id = 117 AND content LIKE '%경직된 장기 계약 방식%'",
      ["## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n해지 위약금은 부과되지 않습니다. 헤이스트는 별도의 의무 약정 기간 족쇄나 위약금 없이 매월 결제되는 유연한 월 정기 구독제 서비스로 운영됩니다.\n\n갑작스러운 중도 해지에 따른 고액의 위약금 걱정 없이 상황에 맞게 안심하고 서비스를 이용하실 수 있습니다."]
    );
  } catch (err) {
    console.error('Failed to run migration for Q&A post 117:', err);
  }

  // Surgical migration/insertion of Q&A post 119
  try {
    const [rows]: any = await connection.query("SELECT COUNT(*) as count FROM web_board_posts WHERE id = 119");
    const count = Number(rows[0]?.count ?? rows[0]?.COUNT ?? 0);
    if (count === 0) {
      await connection.query(
        "INSERT INTO web_board_posts (id, member_id, title, content, category, is_secret, is_notice) VALUES (119, 1, ?, ?, 'Q&A', 0, 0)",
        [
          "월구독료와 가입비는 세금계산서 발행이 되나요?",
          "## 💡 헤이스트(HASTE) 스마트 파트너십 Q&A\n\n네, 세금계산서 발행이 가능합니다.\n\n최초 1회 발생하는 솔루션 가입비(30만 원, VAT 별도) 및 월 기술 이용료(5만 원, VAT 별도)는 부가가치세법에 의거하여 정상적으로 전자세금계산서가 발행됩니다.\n\n다만, **신용카드 정기결제**를 이용하시는 경우에는 신용카드 매입전표 자체가 세법상 적격증빙(매입세액 공제 증빙)으로 처리되므로, 부가가치세 중복 매출 신고 방지를 위해 세금계산서가 중복 발행되지 않습니다.\n\n계좌이체 또는 별도 청구 방식으로 발행이 필요하신 사장님께서는 사업자등록증 사본과 전자세금계산서를 수신하실 이메일 주소를 첨부하여 가맹지원팀(본사) 공식 카카오톡 채널로 신청해 주시면 확인 후 발급을 도와드립니다."
        ]
      );
      console.log("[DB Migration] Seeded Q&A post 119.");
    }
  } catch (err) {
    console.error('Failed to run migration/seeding for Q&A post 119:', err);
  }

  // 3. Populate default records
  await seedInitialData(connection);

  // 4. PostgreSQL Sequence Sync & Auto-Heal Mechanism (Resolves sequence out of sync constraints)
  const tablesToSync = [
    'web_membership_users',
    'web_membership_consultations',
    'web_board_posts',
    'web_board_attachments',
    'web_board_comments',
    'web_admin_accounts',
    'web_home_main',
    'web_interior_layouts',
    'web_brand_films',
    'web_brand_sounds',
    'web_store_licenses',
    'web_verify_logs',
    'web_grade_permissions',
    'music_songs',
    'music_covers',
    'music_playlists',
    'music_comments',
    'music_posts',
    'web_post_likes'
  ];

  for (const table of tablesToSync) {
    try {
      const [seqInfoRes]: any = await connection.query(`
        SELECT pg_get_serial_sequence('${table}', 'id') as seq_name
      `);
      const seqName = seqInfoRes?.[0]?.seq_name || seqInfoRes?.[0]?.SEQ_NAME;
      if (seqName) {
        console.log(`[DB Sequence Auto-Heal] Syncing sequence for ${table} (${seqName})...`);
        await connection.query(`
          SELECT setval('${seqName}', COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)
        `);
      }
    } catch (err: any) {
      console.warn(`[DB Sequence Auto-Heal Warn] Table ${table} sequence sync skipped or generic database dial:`, err.message);
    }
  }
}
