// backend/controllers/youtubeReadingController.js
const youtubeService = require('../services/youtubeReadingService');

// Analyze YouTube video and get summary
exports.analyzeVideo = async (req, res) => {
  console.log('\n🟡 [Controller] ===== ANALYZE VIDEO REQUEST =====');
  console.log('🟡 [Controller] Request body:', req.body);
  console.log('🟡 [Controller] Headers:', req.headers);
  
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      console.log('❌ [Controller] No video URL provided');
      return res.status(400).json({ error: 'Vui lòng cung cấp link YouTube' });
    }

    console.log(`🟡 [Controller] Video URL: ${videoUrl}`);

    // Get subtitle
    console.log('🟡 [Controller] Getting subtitle...');
    const subtitle = await youtubeService.getYoutubeSubtitle(videoUrl);
    console.log('🟡 [Controller] Subtitle length:', subtitle.length);

    // Generate summary
    console.log('🟡 [Controller] Generating summary...');
    const summary = await youtubeService.generateSummary(subtitle);
    console.log('🟡 [Controller] Summary:', summary);

    const result = {
      success: true,
      summary,
      videoId: youtubeService.extractVideoId(videoUrl),
      hasSubtitle: true,
    };
    
    console.log('✅ [Controller] Success! Sending response:', result);
    res.json(result);
  } catch (err) {
    console.error('❌ [Controller] Error:', err.message);
    console.error('❌ [Controller] Stack:', err.stack);
    res.status(500).json({ 
      error: err.message,
      hasSubtitle: false 
    });
  }
};

// Generate reading lesson from YouTube video
exports.generateReading = async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Vui lòng cung cấp link YouTube' });
    }

    console.log(`📺 Tạo bài đọc từ video: ${videoUrl}`);

    // Get subtitle
    const subtitle = await youtubeService.getYoutubeSubtitle(videoUrl);

    // Generate reading content
    const readingContent =
      await youtubeService.generateReadingFromSubtitle(subtitle);

    res.json({
      success: true,
      content: readingContent,
    });
  } catch (err) {
    console.error('❌ Lỗi tạo bài đọc:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = exports;
