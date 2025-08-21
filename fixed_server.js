const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

// CORS設定を強化
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('.'));

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// デバッグ用エンドポイント
app.get('/debug', (req, res) => {
    res.json({
        environment: process.env.NODE_ENV,
        port: PORT,
        competitions_count: competitions.length,
        timestamp: new Date().toISOString()
    });
});

// 修正された競技会リスト（実際のURL構造に基づく）
const competitions = [
    // 2024-2025年度
    {
        name: '第93回全日本フィギュアスケート選手権大会',
        year: '2024-25',
        month: '12月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2024-2025/fs_j/nationals/',
        categories: [
            { name: '男子', file: 'CAT001RS.htm' },
            { name: '女子', file: 'CAT002RS.htm' }
        ],
        dataFormat: 'CAT_RS'
    },
    {
        name: '2024 東北・北海道選手権大会',
        year: '2024-25',
        month: '10月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2024-2025/fs_j/block1/',
        categories: [
            { name: '男子', file: 'CAT001RS.htm' },
            { name: '女子', file: 'CAT002RS.htm' }
        ],
        dataFormat: 'CAT_RS'
    },
    {
        name: '2024 関東選手権大会',
        year: '2024-25',
        month: '10月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2024-2025/fs_j/block2/',
        categories: [
            { name: '男子', file: 'CAT001RS.htm' },
            { name: '女子', file: 'CAT002RS.htm' }
        ],
        dataFormat: 'CAT_RS'
    },
    {
        name: '2024 東京選手権大会',
        year: '2024-25',
        month: '9月', // 東京選手権は9月末〜10月初に開催
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2024-2025/fs_j/block3/',
        categories: [
            { name: '男子', file: 'CAT001RS.htm' },
            { name: '女子', file: 'CAT002RS.htm' }
        ],
        dataFormat: 'CAT_RS'
    },
    {
        name: '2024 中部選手権大会',
        year: '2024-25',
        month: '10月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2024-2025/fs_j/block4/',
        categories: [
            { name: '男子', file: 'CAT001RS.htm' },
            { name: '女子', file: 'CAT002RS.htm' }
        ],
        dataFormat: 'CAT_RS'
    },
    {
        name: '2024 近畿選手権大会',
        year: '2024-25',
        month: '9月', // 近畿ブロック大会は通常9月末〜10月初に開催
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2024-2025/fs_j/block5/',
        categories: [
            { name: '男子', file: 'CAT001RS.htm' },
            { name: '女子', file: 'CAT002RS.htm' }
        ],
        dataFormat: 'CAT_RS'
    },
    {
        name: '2024 中四国九州選手権大会',
        year: '2024-25',
        month: '10月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2024-2025/fs_j/block6/',
        categories: [
            { name: '男子', file: 'CAT001RS.htm' },
            { name: '女子', file: 'CAT002RS.htm' }
        ],
        dataFormat: 'CAT_RS'
    },
    
    // 2023-2024年度（正しいURL構造）
    {
        name: '第92回全日本フィギュアスケート選手権大会',
        year: '2023-24',
        month: '12月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2023-2024/fs_j/national/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2023 東北・北海道選手権大会',
        year: '2023-24',
        month: '10月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2023-2024/fs_j/block1/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2023 関東選手権大会',
        year: '2023-24',
        month: '10月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2023-2024/fs_j/block2/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2023 東京選手権大会',
        year: '2023-24',
        month: '9月', // 東京選手権は9月末〜10月初に開催
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2023-2024/fs_j/block3/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2023 中部選手権大会',
        year: '2023-24',
        month: '10月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2023-2024/fs_j/block4/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2023 近畿選手権大会',
        year: '2023-24',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2023-2024/fs_j/block5/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2023 中四国九州選手権大会',
        year: '2023-24',
        month: '10月',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2023-2024/fs_j/block6/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },

    // 2022-2023年度（自動日付抽出対象）
    {
        name: '第91回全日本フィギュアスケート選手権大会',
        year: '2022-23',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2022-2023/fs_j/nationals/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2022 東北・北海道選手権大会',
        year: '2022-23',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2022-2023/fs_j/block1/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2022 関東選手権大会',
        year: '2022-23',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2022-2023/fs_j/block2/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2022 東京選手権大会',
        year: '2022-23',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2022-2023/fs_j/block3/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2022 中部選手権大会',
        year: '2022-23',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2022-2023/fs_j/block4/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2022 近畿選手権大会',
        year: '2022-23',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2022-2023/fs_j/block5/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2022 中四国九州選手権大会',
        year: '2022-23',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2022-2023/fs_j/block6/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },

    // 2021-2022年度（自動日付抽出対象）
    {
        name: '第90回全日本フィギュアスケート選手権大会',
        year: '2021-22',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2021-2022/fs_j/nationalsenior/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2021 東北・北海道選手権大会',
        year: '2021-22',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2021-2022/fs_j/block1/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2021 関東選手権大会',
        year: '2021-22',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2021-2022/fs_j/block2/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2021 東京選手権大会',
        year: '2021-22',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2021-2022/fs_j/block3/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2021 中部選手権大会',
        year: '2021-22',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2021-2022/fs_j/block4/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2021 近畿選手権大会',
        year: '2021-22',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2021-2022/fs_j/block5/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    },
    {
        name: '2021 中四国九州選手権大会',
        year: '2021-22',
        organizer: '国内',
        baseUrl: 'https://www.jsfresults.com/National/2021-2022/fs_j/block6/',
        categories: [
            { name: '男子', file: 'data0190.htm' },
            { name: '女子', file: 'data0290.htm' }
        ],
        dataFormat: 'DATA_HTM'
    }
];

// 自動日付抽出機能
async function extractCompetitionDate(competition, category) {
    try {
        // 手動で設定済みの月がある場合はそれを使用
        if (competition.month && competition.month !== '不明') {
            return competition.month;
        }

        const url = competition.baseUrl + category.file;
        console.log(`    開催月を自動取得中: ${url}`);
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        // 様々な日付パターンを検索（複数月対応版）
        const datePatterns = [
            // 2024年9月30日〜10月2日 形式（複数月にまたがる）
            /(\d{4})年(\d{1,2})月(\d{1,2})日[〜～\-](\d{1,2})月(\d{1,2})日/,
            // 2024年12月26日〜28日 形式（同一月内）
            /(\d{4})年(\d{1,2})月(\d{1,2})日[〜～\-](\d{1,2})日/,
            // 2024年12月26日 形式
            /(\d{4})年(\d{1,2})月(\d{1,2})日/,
            // 9月30日〜10月2日 形式（複数月にまたがる）
            /(\d{1,2})月(\d{1,2})日[〜～\-](\d{1,2})月(\d{1,2})日/,
            // 12月26日〜28日 形式（同一月内）
            /(\d{1,2})月(\d{1,2})日[〜～\-](\d{1,2})日/,
            // 12月26日 形式
            /(\d{1,2})月(\d{1,2})日/,
            // 2024.9.30-10.2 形式（複数月にまたがる）
            /(\d{4})\.(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})/,
            // 2024.12.26-28 形式（同一月内）
            /(\d{4})\.(\d{1,2})\.(\d{1,2})-(\d{1,2})/,
            // 2024.12.26 形式
            /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
            // 9/30-10/2 形式（複数月にまたがる）
            /(\d{1,2})\/(\d{1,2})-(\d{1,2})\/(\d{1,2})/,
            // 12/26-28 形式（同一月内）
            /(\d{1,2})\/(\d{1,2})-(\d{1,2})/,
            // 12/26 形式
            /(\d{1,2})\/(\d{1,2})/
        ];

        let foundMonth = null;
        let foundText = '';

        // ページ全体のテキストから日付を検索
        const allText = $.text();
        
        for (const pattern of datePatterns) {
            const match = allText.match(pattern);
            if (match) {
                let month;
                
                // 複数月にまたがるパターンをチェック
                if (pattern.source.includes('月.*月') || 
                    pattern.source.includes('\\..*\\.') && match[4] && match[5] ||
                    pattern.source.includes('/.*\/') && match[3] && match[4]) {
                    
                    // 複数月にまたがる場合、早い方の月を選択
                    let startMonth, endMonth;
                    
                    if (pattern.source.includes('年.*月.*月')) {
                        // 2024年9月30日〜10月2日 形式
                        startMonth = parseInt(match[2]);
                        endMonth = parseInt(match[4]);
                    } else if (pattern.source.includes('月.*月')) {
                        // 9月30日〜10月2日 形式
                        startMonth = parseInt(match[1]);
                        endMonth = parseInt(match[3]);
                    } else if (pattern.source.includes('\\..*\\..*\\.')) {
                        // 2024.9.30-10.2 形式
                        startMonth = parseInt(match[2]);
                        endMonth = parseInt(match[4]);
                    } else if (pattern.source.includes('/.*\\/')) {
                        // 9/30-10/2 形式
                        startMonth = parseInt(match[1]);
                        endMonth = parseInt(match[3]);
                    }
                    
                    // 複数月にまたがる場合は早い方の月を選択
                    if (startMonth && endMonth && startMonth !== endMonth) {
                        month = Math.min(startMonth, endMonth);
                        console.log(`      複数月期間発見: "${match[0]}" → ${startMonth}月〜${endMonth}月 → 早い方の${month}月を採用`);
                    } else {
                        month = startMonth;
                    }
                } else {
                    // 単一月または同一月内の期間
                    if (pattern.source.includes('年')) {
                        // 年月日形式
                        month = parseInt(match[2]);
                    } else if (pattern.source.includes('\\.')) {
                        // yyyy.mm.dd形式
                        month = parseInt(match[2]);
                    } else if (pattern.source.includes('/')) {
                        // mm/dd形式
                        month = parseInt(match[1]);
                    } else {
                        // mm月dd日形式
                        month = parseInt(match[1]);
                    }
                    console.log(`      日付パターン発見: "${match[0]}" → ${month}月`);
                }
                
                if (month >= 1 && month <= 12) {
                    foundMonth = month;
                    foundText = match[0];
                    break;
                }
            }
        }

        // より詳細な検索（テーブル内やヘッダー内）
        if (!foundMonth) {
            // テーブルのヘッダーやキャプションをチェック
            $('caption, th, .title, .header, h1, h2, h3').each((index, element) => {
                if (foundMonth) return;
                
                const text = $(element).text();
                for (const pattern of datePatterns) {
                    const match = text.match(pattern);
                    if (match) {
                        let month;
                        
                        // 複数月にまたがるパターンをチェック（詳細検索でも同様の処理）
                        if (pattern.source.includes('月.*月') || 
                            pattern.source.includes('\\..*\\.') && match[4] && match[5] ||
                            pattern.source.includes('/.*\/') && match[3] && match[4]) {
                            
                            let startMonth, endMonth;
                            
                            if (pattern.source.includes('年.*月.*月')) {
                                startMonth = parseInt(match[2]);
                                endMonth = parseInt(match[4]);
                            } else if (pattern.source.includes('月.*月')) {
                                startMonth = parseInt(match[1]);
                                endMonth = parseInt(match[3]);
                            } else if (pattern.source.includes('\\..*\\..*\\.')) {
                                startMonth = parseInt(match[2]);
                                endMonth = parseInt(match[4]);
                            } else if (pattern.source.includes('/.*\\/')) {
                                startMonth = parseInt(match[1]);
                                endMonth = parseInt(match[3]);
                            }
                            
                            if (startMonth && endMonth && startMonth !== endMonth) {
                                month = Math.min(startMonth, endMonth);
                                console.log(`      要素内で複数月期間発見: "${match[0]}" → ${startMonth}月〜${endMonth}月 → 早い方の${month}月を採用`);
                            } else {
                                month = startMonth;
                            }
                        } else {
                            if (pattern.source.includes('年')) {
                                month = parseInt(match[2]);
                            } else if (pattern.source.includes('\\.')) {
                                month = parseInt(match[2]);
                            } else if (pattern.source.includes('/')) {
                                month = parseInt(match[1]);
                            } else {
                                month = parseInt(match[1]);
                            }
                            console.log(`      要素内で日付発見: "${match[0]}" → ${month}月`);
                        }
                        
                        if (month >= 1 && month <= 12) {
                            foundMonth = month;
                            foundText = match[0];
                            return false; // break
                        }
                    }
                }
            });
        }

        if (foundMonth) {
            const monthText = `${foundMonth}月`;
            console.log(`      自動取得成功: ${monthText}`);
            return monthText;
        } else {
            console.log(`      日付情報を発見できませんでした`);
            return '不明';
        }

    } catch (error) {
        console.log(`      日付取得エラー: ${error.message}`);
        return '不明';
    }
}

// 検索機能
async function comprehensiveJSFSearch(playerName) {
    console.log(`\n=== 包括的検索開始: ${playerName} ===`);
    console.log(`対象競技会: ${competitions.length}大会`);
    
    const results = [];
    let searchCount = 0;
    let foundCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < competitions.length; i++) {
        const competition = competitions[i];
        
        console.log(`\n[${i+1}/${competitions.length}] ${competition.name} (${competition.year})`);
        
        for (const category of competition.categories) {
            try {
                const url = competition.baseUrl + category.file;
                searchCount++;
                
                console.log(`  ${category.name}: ${url}`);
                
                const response = await axios.get(url, {
                    timeout: 10000, // タイムアウト短縮
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                        'Cache-Control': 'no-cache'
                    },
                    maxRedirects: 5,
                    validateStatus: function (status) {
                        return status >= 200 && status < 300;
                    }
                });

                const $ = cheerio.load(response.data);
                
                // データ抽出
                let extractedData = null;
                if (competition.dataFormat === 'CAT_RS') {
                    extractedData = extractFromCATRS($, playerName, competition);
                } else if (competition.dataFormat === 'DATA_HTM') {
                    extractedData = extractFromDATAHTMImproved($, playerName, competition);
                }
                
                if (extractedData) {
                    // 開催月を自動取得（選手データが見つかった場合のみ）
                    if (!competition.month || competition.month === '不明') {
                        const autoMonth = await extractCompetitionDate(competition, category);
                        extractedData.month = autoMonth;
                        // 今後のために競技会オブジェクトにも保存
                        competition.month = autoMonth;
                    } else {
                        extractedData.month = competition.month;
                    }
                    
                    // SP/FS詳細得点を取得
                    try {
                        const detailedScores = await fetchDetailedScores(competition.baseUrl, category, playerName, extractedData);
                        if (detailedScores) {
                            extractedData.spScore = detailedScores.spScore;
                            extractedData.fsScore = detailedScores.fsScore;
                        }
                    } catch (error) {
                        console.log(`    詳細得点取得エラー: ${error.message}`);
                    }
                    
                    results.push(extractedData);
                    foundCount++;
                    console.log(`    ✓ データ取得成功: ${extractedData.finalRank}位, ${extractedData.totalScore}点, ${extractedData.month}`);
                } else {
                    console.log(`    - 該当選手なし`);
                }
                
            } catch (error) {
                errorCount++;
                if (error.response) {
                    console.log(`    ❌ HTTP ${error.response.status}: ${error.response.statusText}`);
                } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                    console.log(`    ❌ 接続エラー: ${error.code}`);
                } else if (error.code === 'ETIMEDOUT') {
                    console.log(`    ❌ タイムアウト`);
                } else {
                    console.log(`    ❌ エラー: ${error.message}`);
                }
            }
            
            // サーバー負荷軽減
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    console.log(`\n=== 検索完了 ===`);
    console.log(`検索対象: ${searchCount}ページ`);
    console.log(`成功: ${searchCount - errorCount}ページ`);
    console.log(`エラー: ${errorCount}ページ`);
    console.log(`データ発見: ${foundCount}大会`);
    console.log(`取得結果: ${results.length}件`);
    
    return results;
}

// CAT***RS.htm形式のデータ抽出
function extractFromCATRS($, playerName, competition) {
    const allCells = [];
    $('td').each((index, element) => {
        const text = $(element).text().trim();
        if (text) {
            allCells.push({ index, text });
        }
    });
    
    const targetName = normalizePlayerName(playerName);
    const playerCells = allCells.filter(cell => {
        const cellName = normalizePlayerName(cell.text);
        return cellName === targetName || cell.text.includes(playerName);
    });
    
    for (const playerCell of playerCells) {
        if (normalizePlayerName(playerCell.text) === targetName || 
            playerCell.text === playerName) {
            
            return extractPlayerDataFromCells(allCells, playerCell, competition, 'CAT_RS');
        }
    }
    
    return null;
}

// data***htm形式のデータ抽出（改善版）
function extractFromDATAHTMImproved($, playerName, competition) {
    // テーブル構造を詳しく解析
    const tables = $('table');
    console.log(`    DATA_HTM: ${tables.length}個のテーブルを解析中...`);
    
    for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
        const table = $(tables[tableIndex]);
        const rows = table.find('tr');
        
        console.log(`      テーブル${tableIndex}: ${rows.length}行`);
        
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = $(rows[rowIndex]);
            const cells = row.find('td');
            
            if (cells.length === 0) continue;
            
            // 各セルをチェック
            for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                const cell = $(cells[cellIndex]);
                const cellText = cell.text().trim();
                
                // 選手名の正規化マッチング
                const normalizedCell = normalizePlayerName(cellText);
                const normalizedTarget = normalizePlayerName(playerName);
                
                if (normalizedCell === normalizedTarget || 
                    cellText.includes(playerName) ||
                    normalizedCell.includes(normalizedTarget)) {
                    
                    console.log(`      選手発見: テーブル${tableIndex}, 行${rowIndex}, セル${cellIndex}: "${cellText}"`);
                    
                    // この行からデータを抽出
                    const result = extractPlayerDataFromRow($(row), competition);
                    if (result) {
                        console.log(`        データ抽出成功: ${result.finalRank}位, ${result.totalScore}点`);
                        return result;
                    }
                    
                    // 行からデータが取得できない場合、隣接行をチェック
                    for (let adjacentOffset = -2; adjacentOffset <= 2; adjacentOffset++) {
                        if (adjacentOffset === 0) continue;
                        
                        const adjacentRowIndex = rowIndex + adjacentOffset;
                        if (adjacentRowIndex >= 0 && adjacentRowIndex < rows.length) {
                            const adjacentRow = $(rows[adjacentRowIndex]);
                            const adjacentResult = extractPlayerDataFromRow(adjacentRow, competition, cellText);
                            if (adjacentResult) {
                                console.log(`        隣接行からデータ取得: ${adjacentResult.finalRank}位, ${adjacentResult.totalScore}点`);
                                return adjacentResult;
                            }
                        }
                    }
                }
            }
        }
    }
    
    return null;
}

// 行からデータを抽出
function extractPlayerDataFromRow(rowElement, competition, playerNameFound = '') {
    const cells = rowElement.find('td');
    if (cells.length === 0) return null;
    
    const cellData = [];
    for (let i = 0; i < cells.length; i++) {
        const cellText = cells.eq(i).text().trim();
        cellData.push(cellText);
    }
    
    console.log(`        行データ: [${cellData.join(', ')}]`);
    
    let rank = '';
    let totalScore = 0;
    let spRank = 0;
    let fsRank = 0;
    let spScore = 0;
    let fsScore = 0;
    let isWithdrawal = false;
    
    // WD（棄権）チェック
    if (cellData.some(cell => cell === 'WD' || cell.toLowerCase() === 'withdrawn')) {
        isWithdrawal = true;
        rank = 'WD';
        console.log(`        WD検出`);
    }
    
    if (!isWithdrawal && cellData.length >= 6) {
        // DATA_HTM形式: [順位, 選手名, 所属, SP順位, FS順位, 総合得点]
        const potentialRank = cellData[0];
        const potentialSpRank = cellData[3];  
        const potentialFsRank = cellData[4];
        const potentialTotalScore = cellData[5];
        
        // 順位（最初のセル）
        if (/^\d+\.?$/.test(potentialRank)) {
            rank = potentialRank.replace('.', '');
            console.log(`          順位: ${rank}`);
        }
        
        // SP順位
        if (/^\d+$/.test(potentialSpRank) && parseInt(potentialSpRank) >= 1 && parseInt(potentialSpRank) <= 50) {
            spRank = parseInt(potentialSpRank);
            console.log(`          SP順位: ${spRank}`);
        }
        
        // FS順位  
        if (/^\d+$/.test(potentialFsRank) && parseInt(potentialFsRank) >= 1 && parseInt(potentialFsRank) <= 50) {
            fsRank = parseInt(potentialFsRank);
            console.log(`          FS順位: ${fsRank}`);
        }
        
        // 総合得点（最後のセル）
        if (/^\d+\.\d+$/.test(potentialTotalScore) && parseFloat(potentialTotalScore) >= 30) {
            totalScore = parseFloat(potentialTotalScore);
            console.log(`          総合得点: ${totalScore}`);
        }
        
        // SP/FS得点は詳細ページから取得が必要（推定値は表示しない）
        // 後で詳細ページからTSSを取得して設定する
    } else if (!isWithdrawal) {
        // 旧ロジック（フォールバック）
        for (let i = 0; i < cellData.length; i++) {
            const cell = cellData[i];
            
            // 順位（1-50の整数）
            if (/^\d+\.?$/.test(cell) && parseInt(cell.replace('.', '')) >= 1 && parseInt(cell.replace('.', '')) <= 50) {
                if (!rank) {
                    rank = cell.replace('.', '');
                    console.log(`          順位: ${rank}`);
                }
            }
            
            // 得点（小数点を含む数値で30点以上）
            if (/^\d+\.\d+$/.test(cell) && parseFloat(cell) >= 30) {
                const score = parseFloat(cell);
                if (!totalScore || score > totalScore) {
                    totalScore = score;
                    console.log(`          総合得点: ${totalScore}`);
                }
            }
        }
    } else {
        // WDでも得点がある場合を探す
        for (let i = 0; i < cellData.length; i++) {
            const cell = cellData[i];
            if (/^\d+\.\d+$/.test(cell) && parseFloat(cell) >= 10) {
                totalScore = parseFloat(cell);
                console.log(`          WD時の得点: ${totalScore}`);
                break;
            }
        }
    }
    
    // データが十分に取得できた場合にのみ返す
    if (rank && (totalScore > 0 || isWithdrawal)) {
        return {
            year: competition.year,
            month: '不明', // 自動抽出で後で設定される
            organizer: competition.organizer,
            competition: competition.name,
            finalRank: isWithdrawal ? 'WD' : parseInt(rank),
            totalScore: totalScore,
            spRank: spRank,
            spScore: spScore,
            fsRank: fsRank,
            fsScore: fsScore,
            status: isWithdrawal ? 'WD' : 'COMPLETED'
        };
    }
    
    return null;
}

// 旧方式のデータ抽出（フォールバック用）
function extractPlayerDataFromCells(allCells, playerCell, competition, format) {
    try {
        const baseIndex = playerCell.index;
        console.log(`      データ抽出: ${format}形式, 基準セル${baseIndex}: "${playerCell.text}"`);
        
        // WD（棄権）検出
        let isWithdrawal = false;
        for (let i = Math.max(0, baseIndex - 5); i <= Math.min(allCells.length - 1, baseIndex + 15); i++) {
            const cell = allCells.find(c => c.index === i);
            if (cell && cell.text === 'WD') {
                isWithdrawal = true;
                console.log(`        WD検出: セル${i}`);
                break;
            }
        }
        
        let rank = '';
        let totalScore = 0;
        let spRank = 0;
        let fsRank = 0;
        let spScore = 0;
        let fsScore = 0;
        
        if (isWithdrawal) {
            rank = 'WD';
            for (let i = baseIndex + 1; i <= Math.min(allCells.length - 1, baseIndex + 20); i++) {
                const cell = allCells.find(c => c.index === i);
                if (cell && /^\d+\.\d+$/.test(cell.text) && parseFloat(cell.text) >= 10) {
                    totalScore = parseFloat(cell.text);
                    break;
                }
            }
        } else {
            // 前方から最終順位を探索
            for (let i = Math.max(0, baseIndex - 20); i < baseIndex; i++) {
                const cell = allCells.find(c => c.index === i);
                if (cell && /^\d+$/.test(cell.text) && parseInt(cell.text) <= 50) {
                    rank = cell.text;
                }
            }
            
            // 後方から得点データを取得
            let scoreFound = false;
            for (let i = baseIndex + 1; i <= Math.min(allCells.length - 1, baseIndex + 25); i++) {
                const cell = allCells.find(c => c.index === i);
                if (cell) {
                    if (!scoreFound && /^\d+\.\d+$/.test(cell.text) && parseFloat(cell.text) >= 30) {
                        totalScore = parseFloat(cell.text);
                        scoreFound = true;
                        console.log(`          総合得点: ${totalScore}`);
                    }
                    
                    if (/^\d+$/.test(cell.text) && parseInt(cell.text) <= 50) {
                        if (!spRank) {
                            spRank = parseInt(cell.text);
                            console.log(`          SP順位: ${spRank}`);
                        } else if (!fsRank) {
                            fsRank = parseInt(cell.text);
                            console.log(`          FS順位: ${fsRank}`);
                        }
                    }
                }
            }
        }
        
        console.log(`        最終結果: 順位=${rank}, 総合=${totalScore}, SP=${spRank}/${spScore}, FS=${fsRank}/${fsScore}`);
        
        if (rank && (totalScore > 0 || isWithdrawal)) {
            return {
                year: competition.year,
                month: '不明', // 自動抽出で後で設定される
                organizer: competition.organizer,
                competition: competition.name,
                finalRank: rank === 'WD' ? 'WD' : parseInt(rank),
                totalScore: totalScore,
                spRank: spRank,
                spScore: spScore,
                fsRank: fsRank,
                fsScore: fsScore,
                status: isWithdrawal ? 'WD' : 'COMPLETED'
            };
        }
        
        return null;
    } catch (error) {
        console.log(`        データ抽出エラー: ${error.message}`);
        return null;
    }
}

// 詳細得点取得関数
async function fetchDetailedScores(baseUrl, category, playerName, basicData) {
    try {
        // SP詳細ページのURL構築
        let spDetailUrl, fsDetailUrl;
        
        if (basicData.year === '2024-25') {
            // 2024-25シーズンのSEG形式
            if (category.name === '男子') {
                spDetailUrl = baseUrl.replace(/\/$/, '') + `/SEG001.htm`; // 男子SP
                fsDetailUrl = baseUrl.replace(/\/$/, '') + `/SEG002.htm`; // 男子FS
            } else {
                spDetailUrl = baseUrl.replace(/\/$/, '') + `/SEG003.htm`; // 女子SP
                fsDetailUrl = baseUrl.replace(/\/$/, '') + `/SEG004.htm`; // 女子FS
            }
        } else {
            // 2023-24以前のdata0xxx形式
            if (category.name === '男子') {
                spDetailUrl = baseUrl.replace(/\/$/, '') + `/data0103.htm`; // 男子SP
                fsDetailUrl = baseUrl.replace(/\/$/, '') + `/data0105.htm`; // 男子FS
            } else {
                spDetailUrl = baseUrl.replace(/\/$/, '') + `/data0203.htm`; // 女子SP
                fsDetailUrl = baseUrl.replace(/\/$/, '') + `/data0205.htm`; // 女子FS
            }
        }

        console.log(`      SP詳細: ${spDetailUrl}`);
        console.log(`      FS詳細: ${fsDetailUrl}`);

        let spScore = 0, fsScore = 0;

        // SP得点取得
        try {
            const spResponse = await axios.get(spDetailUrl, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const sp$ = cheerio.load(spResponse.data);
            spScore = extractScoreFromDetailPage(sp$, playerName, 'SP');
            if (spScore > 0) console.log(`        SP得点: ${spScore}`);
        } catch (error) {
            console.log(`        SP取得エラー: ${error.response ? error.response.status : error.message}`);
        }

        // FS得点取得
        try {
            const fsResponse = await axios.get(fsDetailUrl, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const fs$ = cheerio.load(fsResponse.data);
            fsScore = extractScoreFromDetailPage(fs$, playerName, 'FS');
            if (fsScore > 0) console.log(`        FS得点: ${fsScore}`);
        } catch (error) {
            console.log(`        FS取得エラー: ${error.response ? error.response.status : error.message}`);
        }

        if (spScore > 0 || fsScore > 0) {
            return { spScore, fsScore };
        }
        
        return null;

    } catch (error) {
        console.log(`      詳細得点取得エラー: ${error.message}`);
        return null;
    }
}

// 詳細ページからスコアを抽出
function extractScoreFromDetailPage($, playerName, segment) {
    try {
        // テーブル行ベースの解析
        const tables = $('table');
        
        for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
            const table = $(tables[tableIndex]);
            const rows = table.find('tr');
            
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                const row = $(rows[rowIndex]);
                const cells = row.find('td');
                
                if (cells.length === 0) continue;
                
                // 選手名を含むセルを検索（個別の行でのみ検索）
                let playerFound = false;
                let playerCellIndex = -1;
                
                for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                    const cell = $(cells[cellIndex]);
                    const cellText = cell.text().trim();
                    
                    // 選手名の正規化マッチング（単一の選手名のみマッチ）
                    const normalizedCell = normalizePlayerName(cellText);
                    const normalizedTarget = normalizePlayerName(playerName);
                    
                    // 完全一致または部分一致（ただし、大量データを除外）
                    if ((normalizedCell === normalizedTarget || cellText === playerName) ||
                        (cellText.includes(playerName) && cellText.length < 100)) { // 大量データを除外
                        
                        playerFound = true;
                        playerCellIndex = cellIndex;
                        console.log(`        ${segment}で選手発見: 行${rowIndex}, セル${cellIndex}: "${cellText.substring(0, 50)}"`);
                        break;
                    }
                }
                
                if (playerFound) {
                    // まず選手行でWD（棄権）チェック（選手のセル近辺のみで判定）
                    let isWD = false;
                    
                    // 選手名の前後3セルのみでWDチェック（大量データを除外）
                    const startCheck = Math.max(0, playerCellIndex - 3);
                    const endCheck = Math.min(cells.length, playerCellIndex + 4);
                    
                    for (let cellIndex = startCheck; cellIndex < endCheck; cellIndex++) {
                        const cell = $(cells[cellIndex]);
                        const cellText = cell.text().trim();
                        
                        // WDかつ短いテキストのみ（大量データを除外）
                        if ((cellText === 'WD' || cellText.toLowerCase() === 'withdrawn') && cellText.length < 10) {
                            isWD = true;
                            console.log(`        ${segment}でWD検出: セル${cellIndex} = "${cellText}"`);
                            break;
                        }
                    }
                    
                    // WDの場合は得点0を返す
                    if (isWD) {
                        console.log(`        ${segment}WDのため得点0を返す`);
                        return 0;
                    }
                    
                    // 同じ行でTSS得点を検索
                    for (let cellIndex = playerCellIndex; cellIndex < cells.length; cellIndex++) {
                        const cell = $(cells[cellIndex]);
                        const cellText = cell.text().trim();
                        
                        // 空欄チェック（WDの可能性）
                        if (cellText === '' || cellText === '-') {
                            continue;
                        }
                        
                        // TSS=XX.XXパターンを検索
                        const tssMatch = cellText.match(/TSS=?\s*(\d{1,3}\.\d{2})/i);
                        if (tssMatch) {
                            const score = parseFloat(tssMatch[1]);
                            if (score >= 15.00 && score <= 200.00) {
                                console.log(`        ${segment}TSS得点発見: ${score}`);
                                return score;
                            }
                        }
                        
                        // 数値のみパターン（TSS列であることを確認）
                        if (/^\d{2,3}\.\d{2}$/.test(cellText)) {
                            const score = parseFloat(cellText);
                            if (score >= 15.00 && score <= 200.00) {
                                // TSS列かどうかをヘッダーで確認
                                const headerRow = table.find('tr').first();
                                const headerCells = headerRow.find('th, td');
                                
                                if (cellIndex < headerCells.length) {
                                    const headerText = $(headerCells[cellIndex]).text().trim();
                                    if (headerText.includes('TSS') || 
                                        (cellIndex > 0 && $(headerCells[cellIndex-1]).text().includes('TSS'))) {
                                        console.log(`        ${segment}TSS列の得点発見: ${score}`);
                                        return score;
                                    }
                                }
                                
                                // ヘッダーが不明な場合、得点範囲で判定（ただし選手の行の得点であることを確認）
                                if (score >= 20.00 && score <= 150.00 && cellIndex >= playerCellIndex + 1) {
                                    console.log(`        ${segment}推定TSS得点: ${score}`);
                                    return score;
                                }
                            }
                        }
                    }
                    
                    // 同じ行に見つからない場合、隣接する行をチェック
                    for (let adjacentOffset = -1; adjacentOffset <= 1; adjacentOffset++) {
                        if (adjacentOffset === 0) continue;
                        
                        const adjacentRowIndex = rowIndex + adjacentOffset;
                        if (adjacentRowIndex >= 0 && adjacentRowIndex < rows.length) {
                            const adjacentRow = $(rows[adjacentRowIndex]);
                            const adjacentCells = adjacentRow.find('td');
                            
                            if (adjacentCells.length > playerCellIndex) {
                                for (let cellIndex = playerCellIndex; cellIndex < adjacentCells.length; cellIndex++) {
                                    const cell = $(adjacentCells[cellIndex]);
                                    const cellText = cell.text().trim();
                                    
                                    const tssMatch = cellText.match(/TSS=?\s*(\d{1,3}\.\d{2})/i);
                                    if (tssMatch) {
                                        const score = parseFloat(tssMatch[1]);
                                        if (score >= 15.00 && score <= 200.00) {
                                            console.log(`        ${segment}隣接行TSS得点発見: ${score}`);
                                            return score;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // 選手は見つかったが得点が見つからない場合
                    console.log(`        ${segment}選手は見つかったが有効なTSS得点なし`);
                    return 0;
                }
            }
        }
        
        console.log(`        ${segment}ページに選手名なし`);
        return 0;
    } catch (error) {
        console.log(`        ${segment}スコア抽出エラー: ${error.message}`);
        return 0;
    }
}

function normalizePlayerName(name) {
    if (!name) return '';
    return name
        .replace(/\s+/g, '')
        .replace(/[　\u3000]/g, '')
        .replace(/[・･]/g, '')
        .toLowerCase()
        .trim();
}

// API エンドポイント（強化版）
app.get('/api/search/:playerName', async (req, res) => {
    try {
        const playerName = decodeURIComponent(req.params.playerName);
        console.log(`\n=== API検索要求: ${playerName} ===`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        
        // リクエストタイムアウト設定（Vercel制限対応）
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 25000); // 25秒でタイムアウト
        });
        
        const searchPromise = comprehensiveJSFSearch(playerName);
        
        const results = await Promise.race([searchPromise, timeoutPromise]);
        
        if (results.length > 0) {
            console.log(`\n=== 最終結果: ${results.length}件 ===`);
            results.forEach((result, index) => {
                console.log(`${index + 1}. ${result.year} ${result.competition} - ${result.finalRank}位 (${result.totalScore}点)`);
            });
            
            // 新しい順にソート
            results.sort((a, b) => b.year.localeCompare(a.year));
            res.json({ 
                success: true, 
                data: results,
                timestamp: new Date().toISOString(),
                search_count: results.length
            });
        } else {
            console.log(`No results found for ${playerName}`);
            res.json({ 
                success: false, 
                message: 'JSFサイトでデータが見つかりませんでした',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message.includes('timeout') ? 
                'サーバー処理がタイムアウトしました。しばらく待ってから再度お試しください。' : 
                'サーバーエラーが発生しました',
            error_type: error.message.includes('timeout') ? 'timeout' : 'server_error',
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'figure_skate_comprehensive.html'));
});

app.listen(PORT, () => {
    console.log(`\n=== 修正版フィギュアスケート成績検索サーバー ===`);
    console.log(`サーバー起動: http://localhost:${PORT}`);
    console.log(`対象大会: ${competitions.length}大会`);
    console.log(`対象年度: 2024-25, 2023-24, 2022-23, 2021-22 (4年分)`);
    console.log(`修正点: 正しいURL構造・改善されたDATA_HTM解析・テーブル構造対応\n`);
});