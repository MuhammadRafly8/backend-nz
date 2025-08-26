'use strict';

const { v4: uuidv4 } = require('uuid');
const slugify = require('../utils/slugify'); // Pastikan path ini sesuai

// Gunakan ID yang telah Anda berikan
const ACTUAL_AUTHOR_ID = 'eda27829-e4fc-4f34-9f3b-f0b8f7f382fd'; // ID User
const ACTUAL_CATEGORY_ID = 'ebdd0a00-61a4-41a5-9c04-21a7f7d55576'; // ID Category

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const articles = [
      {
        id: uuidv4(),
        title: 'Jurusan RPL: Membuka Gerbang Karir di Dunia Teknologi',
        content: `Rekayasa Perangkat Lunak (RPL) adalah jurusan yang mempelajari segala aspek pengembangan perangkat lunak, mulai dari perencanaan, analisis, desain, implementasi, pengujian, hingga pemeliharaan sistem perangkat lunak. Siswa akan dibekali dengan kemampuan coding yang kuat, memahami berbagai bahasa pemrograman seperti Python, Java, JavaScript, dan lainnya, serta prinsip-prinsip software engineering dan arsitektur sistem.

Jurusan ini tidak hanya fokus pada pemrograman, tetapi juga mencakup pemahaman tentang basis data, jaringan komputer, keamanan siber, kecerdasan buatan, dan pengembangan aplikasi web maupun mobile. Dengan kurikulum yang dirancang mengikuti perkembangan industri teknologi terkini, lulusan RPL diharapkan mampu menjadi developer full-stack, software engineer, system analyst, atau bahkan entrepreneur di bidang teknologi.

Di era digital yang terus berkembang pesat, kebutuhan akan tenaga ahli RPL sangat tinggi. Lulusan RPL dapat bekerja di berbagai industri, tidak terbatas pada perusahaan teknologi saja, namun juga bank, kesehatan, pendidikan, e-commerce, dan sektor lain yang mengandalkan sistem informasi. Karir yang dapat ditempuh antara lain Software Developer, Web Developer, Mobile App Developer, Data Analyst, Game Developer, hingga posisi manajerial seperti IT Project Manager atau Chief Technology Officer (CTO).`,
        image: null,
        published: true,
        viewCount: 120, // Memberikan nilai awal yang realistis
        publishedAt: new Date(),
        authorId: ACTUAL_AUTHOR_ID,
        categoryId: ACTUAL_CATEGORY_ID,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Mengapa Jurusan RPL Menjadi Pilihan Tepat di Era Revolusi Industri 4.0?',
        content: `Revolusi Industri 4.0 yang ditandai dengan otomasi, Internet of Things (IoT), Big Data, dan Kecerdasan Buatan (AI) telah mengubah lanskap pekerjaan secara global. Di tengah perubahan ini, Jurusan Rekayasa Perangkat Lunak (RPL) muncul sebagai salah satu pilihan pendidikan yang paling strategis dan menjanjikan untuk masa depan.

Keunggulan utama RPL terletak pada relevansinya yang tinggi dengan kebutuhan industri. Kurikulumnya dirancang untuk mencetak lulusan yang langsung 'siap pakai' di dunia kerja. Siswa tidak hanya belajar teori, tetapi juga banyak melakukan praktik langsung dalam mengembangkan proyek-proyek nyata. Hal ini memungkinkan mereka untuk membangun portofolio yang kuat sebelum lulus.

Selain itu, lulusan RPL memiliki kemampuan adaptabilitas yang tinggi. Mereka dilatih untuk terus belajar dan mengikuti perkembangan teknologi yang dinamis. Keterampilan pemecahan masalah, logika, dan berpikir kritis yang mereka dapatkan sangat berharga di berbagai bidang. Fleksibilitas ini membuat mereka tidak hanya terpaku pada satu jenis pekerjaan, tetapi bisa berkembang ke berbagai jalur karir, seperti menjadi ahli keamanan siber, pengembang solusi AI, atau konsultan teknologi.

Dengan prospek karir yang cerah, komunitas yang luas, dan potensi untuk berkontribusi pada inovasi teknologi yang dapat mengubah dunia, tidak heran jika minat terhadap jurusan RPL terus meningkat. Bagi siswa yang memiliki passion di bidang teknologi dan ingin menjadi bagian dari masa depan digital, RPL adalah jurusan yang sangat layak untuk dipertimbangkan.`,
        image: null,
        published: true,
        viewCount: 45, // Memberikan nilai awal yang realistis
        publishedAt: new Date(),
        authorId: ACTUAL_AUTHOR_ID,
        categoryId: ACTUAL_CATEGORY_ID,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const articlesWithSlug = articles.map(article => ({
      ...article,
      slug: slugify(article.title)
    }));

    await queryInterface.bulkInsert('Articles', articlesWithSlug, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Articles', {
      title: {
        [Sequelize.Op.in]: [
          'Jurusan RPL: Membuka Gerbang Karir di Dunia Teknologi',
          'Mengapa Jurusan RPL Menjadi Pilihan Tepat di Era Revolusi Industri 4.0?'
        ]
      }
    }, {});
  }
};