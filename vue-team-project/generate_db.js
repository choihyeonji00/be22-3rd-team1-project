const fs = require('fs');

const dbPath = './src/data/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Keep existing Pizza
const pizzas = db.menuItems.filter(item => item.category === 'pizza');

// 2. Generators
const categories = [
    { id: 'hamburger', name: '버거', count: 20, filePrefix: 'hamburger' },
    { id: 'drink', name: '음료', count: 20, filePrefix: 'drink' },
    { id: 'sandwich', name: '샌드위치', count: 20, filePrefix: 'sandwich' },
    { id: 'side', name: '사이드', count: 20, filePrefix: 'side' },
    { id: 'dessert', name: '디저트', count: 20, filePrefix: 'dessert' }
];

const names = {
    hamburger: ['클래식', '치즈', '더블', '베이컨', '불고기', '쉬림프', '치킨', '핫', '머쉬룸', '트러플', '와규', '할라피뇨', '에그', '통새우', '비프', '갈릭', '어니언', '칠리', '바베큐', '하와이안'],
    drink: ['콜라', '사이다', '제로콜라', '환타', '마운틴듀', '아메리카노', '라떼', '주스', '에이드', '스무디', '밀크쉐이크', '홍차', '녹차', '우유', '탄산수', '맥주', '하이볼', '식혜', '수정과', '이온음료'],
    sandwich: ['에그', '햄치즈', '참치', '치킨', 'BLT', '아보카도', '비프', '크래미', '단호박', '베지', '모닝', '크루아상', '바게트', '파니니', '토스트', '베이글', '인기가요', '클럽', '잠봉뵈르', '반미'],
    side: ['감자튀김', '치즈스틱', '치킨너겟', '어니언링', '콘샐러드', '코울슬로', '윙', '봉', '너겟', '팝콘치킨', '해쉬브라운', '웨지감자', '나초', '치즈볼', '소떡소떡', '타코야끼', '오징어링', '새우튀김', '군만두', '떡볶이'],
    dessert: ['아이스크림', '브라우니', '치즈케이크', '애플파이', '츄러스', '에그타르트', '와플', '마카롱', '쿠키', '도넛', '머핀', '푸딩', '젤리', '요거트', '빙수', '호떡', '붕어빵', '초콜릿', '사탕', '크레이프']
};

let newItems = [...pizzas];
let idCounter = 100;

categories.forEach(cat => {
    for (let i = 1; i <= cat.count; i++) {
        const itemName = names[cat.id][(i - 1) % names[cat.id].length] || cat.name;
        const item = {
            id: String(idCounter++),
            name: `${itemName} ${cat.name}`, // 예: 클래식 버거
            price: 3000 + (i * 100),
            image: `/src/assets/images/${cat.id}/${cat.filePrefix}_${i}.png`,
            description: `맛있는 ${itemName} ${cat.name}`,
            category: cat.id
        };

        if (cat.id === 'hamburger') {
            item.setOptions = [{ name: "버거 (단품)", price: 0 }, { name: "세트 (감튀+콜라)", price: 3000 }];
            item.addOptions = [{ name: "베이컨 추가", price: 1500 }, { name: "치즈 추가", price: 1000 }];
        }
        newItems.push(item);
    }
});

// Update DB
db.menuItems = newItems;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Generated ${newItems.length} menu items.`);
