import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VenueService } from '../services/venueService.js';
import { Venue, Review, User } from '../models/index.js';

describe('VenueService Unit Tests (Skenario Berhasil & Gagal)', () => {
  let sampleVenue = null;
  let sampleReview = null;

  it('[BERHASIL] Mengambil seluruh daftar lapangan olahraga', async () => {
    const venues = await VenueService.getVenues({});
    assert.ok(Array.isArray(venues), 'Venues harus berupa array');
    assert.ok(venues.length > 0, 'Harus ada venue yang dikembalikan');

    sampleVenue = venues[0];
    assert.ok(sampleVenue.name, 'Venue harus memiliki nama');
    assert.ok(sampleVenue.city_name || sampleVenue.city, 'Venue harus memiliki kota');
    assert.ok(typeof sampleVenue.base_price_hourly === 'number' || typeof sampleVenue.priceHourly === 'number', 'Tarif harus berupa angka');
    assert.ok(sampleVenue.priceFormatted.startsWith('Rp '), 'Format tarif harus berawalan "Rp "');
  });

  it('[BERHASIL] Filter lapangan berdasarkan cabang olahraga (Futsal)', async () => {
    const venues = await VenueService.getVenues({ sport: 'futsal' });
    assert.ok(Array.isArray(venues));
    assert.ok(venues.length > 0);
    venues.forEach(v => {
      const isFutsal = v.sport === 'futsal' || (v.courts && v.courts.some(c => c.category_id === 'futsal'));
      assert.ok(isFutsal, `Venue ${v.name} harus bertipe futsal`);
    });
  });

  it('[BERHASIL] Filter lapangan berdasarkan cabang olahraga (Badminton)', async () => {
    const venues = await VenueService.getVenues({ sport: 'badminton' });
    assert.ok(Array.isArray(venues));
    venues.forEach(v => {
      const isBadminton = v.sport === 'badminton' || (v.courts && v.courts.some(c => c.category_id === 'badminton'));
      assert.ok(isBadminton, `Venue ${v.name} harus bertipe badminton`);
    });
  });

  it('[BERHASIL] Filter lapangan berdasarkan kota (Bandung)', async () => {
    const venues = await VenueService.getVenues({ city: 'Bandung' });
    assert.ok(Array.isArray(venues));
    venues.forEach(v => {
      const matchCity = (v.city_name && v.city_name.includes('Bandung')) || (v.address && v.address.includes('Bandung'));
      assert.ok(matchCity, `Venue ${v.name} harus berlokasi di Bandung`);
    });
  });

  it('[BERHASIL] Filter lapangan berdasarkan kota (Jakarta)', async () => {
    const venues = await VenueService.getVenues({ city: 'Jakarta' });
    assert.ok(Array.isArray(venues));
    assert.ok(venues.length > 0);
    venues.forEach(v => {
      const matchCity = (v.city_name && v.city_name.includes('Jakarta')) || (v.address && v.address.includes('Jakarta'));
      assert.ok(matchCity, `Venue ${v.name} harus berlokasi di Jakarta`);
    });
  });

  it('[BERHASIL] Hitung jarak terdekat dengan koordinat pengguna (Radius Haversine)', async () => {
    // Koordinat Jakarta Selatan (-6.29, 106.80)
    const venues = await VenueService.getVenues({
      userLat: -6.29,
      userLng: 106.80,
      radius: 10,
      sort: 'distance'
    });
    assert.ok(Array.isArray(venues));
    venues.forEach(v => {
      assert.ok(typeof v.distanceKm === 'number', 'distanceKm harus berupa angka');
      assert.ok(v.distanceKm <= 10, `Jarak venue ${v.name} (${v.distanceKm} km) harus <= 10 km`);
    });
  });

  it('[BERHASIL] Sorting harga terendah ke tertinggi (price_low)', async () => {
    const venues = await VenueService.getVenues({ sort: 'price_low' });
    assert.ok(venues.length >= 2);
    for (let i = 0; i < venues.length - 1; i++) {
      const priceA = venues[i].base_price_hourly || venues[i].priceHourly;
      const priceB = venues[i + 1].base_price_hourly || venues[i + 1].priceHourly;
      assert.ok(priceA <= priceB, `Harga ${priceA} harus lebih kecil/sama dengan ${priceB}`);
    }
  });

  it('[BERHASIL] Sorting rating tertinggi ke terendah (rating_high)', async () => {
    const venues = await VenueService.getVenues({ sort: 'rating_high' });
    assert.ok(venues.length >= 2);
    for (let i = 0; i < venues.length - 1; i++) {
      const ratingA = Number(venues[i].rating_avg);
      const ratingB = Number(venues[i + 1].rating_avg);
      assert.ok(ratingA >= ratingB, `Rating ${ratingA} harus >= ${ratingB}`);
    }
  });

  it('[BERHASIL] Sorting jarak terdekat ke terjauh (distance)', async () => {
    const venues = await VenueService.getVenues({
      userLat: -6.2088,
      userLng: 106.8456,
      sort: 'distance'
    });
    assert.ok(venues.length >= 2);
    for (let i = 0; i < venues.length - 1; i++) {
      assert.ok(venues[i].distanceKm <= venues[i + 1].distanceKm);
    }
  });

  it('[BERHASIL] Sorting rekomendasi (default: rating * reviewCount)', async () => {
    const venues = await VenueService.getVenues({ sort: 'recommended' });
    assert.ok(venues.length >= 2);
    const score0 = Number(venues[0].rating_avg) * Number(venues[0].review_count);
    const score1 = Number(venues[1].rating_avg) * Number(venues[1].review_count);
    assert.ok(score0 >= score1, 'Venue pertama harus memiliki skor rekomendasi >= venue kedua');
  });

  it('[BERHASIL] Filter spesifikasi tipe ruangan (court_types = indoor)', async () => {
    const venues = await VenueService.getVenues({ court_types: 'indoor' });
    assert.ok(Array.isArray(venues));
    venues.forEach(v => {
      const match = v.court_type?.toLowerCase().includes('indoor') ||
        (v.courts && v.courts.some(c => c.court_type?.toLowerCase().includes('indoor')));
      assert.ok(match, `Venue ${v.name} harus memiliki tipe indoor`);
    });
  });

  it('[BERHASIL] Filter spesifikasi permukaan lantai (floor_types = Rumput Sintetis)', async () => {
    const venues = await VenueService.getVenues({ floor_types: 'Rumput Sintetis' });
    assert.ok(Array.isArray(venues));
    venues.forEach(v => {
      const match = v.floor_type?.toLowerCase().includes('sintetis') ||
        (v.courts && v.courts.some(c => c.floor_type?.toLowerCase().includes('sintetis')));
      assert.ok(match, `Venue ${v.name} harus berlantai sintetis`);
    });
  });

  it('[BERHASIL] Filter spesifikasi fasilitas (amenities = Shower Air Hangat)', async () => {
    const venues = await VenueService.getVenues({ amenities: 'Shower' });
    assert.ok(Array.isArray(venues));
    venues.forEach(v => {
      const match = v.amenities.some(a => a.toLowerCase().includes('shower'));
      assert.ok(match, `Venue ${v.name} harus memiliki fasilitas shower`);
    });
  });

  it('[BERHASIL] Ambil detail venue berdasarkan slug valid', async () => {
    const venue = await VenueService.getVenueById('the-emerald-arena-jakarta');
    assert.ok(venue, 'Venue harus ditemukan');
    assert.equal(venue.slug, 'the-emerald-arena-jakarta');
    assert.ok(Array.isArray(venue.courts), 'Detail harus memuat array courts');
    assert.ok(Array.isArray(venue.amenities), 'Detail harus memuat amenities');
  });

  it('[BERHASIL] Ambil detail venue berdasarkan UUID valid', async () => {
    assert.ok(sampleVenue, 'sampleVenue harus sudah tersedia');
    const venue = await VenueService.getVenueById(sampleVenue.id);
    assert.ok(venue);
    assert.equal(venue.id, sampleVenue.id);
  });

  it('[GAGAL] Ambil detail venue dengan slug yang tidak ada mengembalikan null', async () => {
    const venue = await VenueService.getVenueById('slug-tidak-ditemukan-xyz-404');
    assert.equal(venue, null);
  });

  it('[GAGAL] Ambil detail venue dengan UUID yang tidak ada mengembalikan null', async () => {
    const venue = await VenueService.getVenueById('00000000-0000-0000-0000-000000000000');
    assert.equal(venue, null);
  });

  it('[GAGAL] Pencarian dengan kata kunci yang tidak ada harus mengembalikan array kosong', async () => {
    const venues = await VenueService.getVenues({ search: 'NAMA_VENUE_TIDAK_MUNGKIN_ADA_XYZ_999' });
    assert.ok(Array.isArray(venues));
    assert.equal(venues.length, 0, 'Daftar venue harus kosong jika tidak ada yang cocok');
  });

  // Master Data
  it('[BERHASIL] getCategories mengembalikan seluruh kategori olahraga', async () => {
    const categories = await VenueService.getCategories();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length >= 5);
    const futsal = categories.find(c => c.id === 'futsal');
    assert.ok(futsal);
    assert.equal(futsal.name, 'Futsal & Mini Soccer');
    assert.ok(futsal.icon);
    assert.ok(futsal.color_hex);
  });

  it('[BERHASIL] getCities mengembalikan master data kota dan relasi provinsi', async () => {
    const cities = await VenueService.getCities();
    assert.ok(Array.isArray(cities));
    assert.ok(cities.length > 0);
    const firstCity = cities[0];
    assert.ok(firstCity.name);
    assert.ok(firstCity.latitude);
    assert.ok(firstCity.longitude);
    assert.ok(firstCity.province, 'Kota harus berelasi dengan provinsi');
  });

  // Reviews & Rating
  it('[BERHASIL] getVenueReviews mengembalikan ulasan dan ringkasan 4 aspek penilaian', async () => {
    const result = await VenueService.getVenueReviews('the-emerald-arena-jakarta');
    assert.ok(result);
    assert.equal(result.venue_name, 'The Emerald Arena Jakarta');
    assert.ok(result.aspects);
    assert.ok(typeof result.aspects.floor === 'number');
    assert.ok(typeof result.aspects.lighting === 'number');
    assert.ok(typeof result.aspects.cleanliness === 'number');
    assert.ok(typeof result.aspects.hospitality === 'number');
    assert.ok(Array.isArray(result.reviews));

    if (result.reviews.length > 0) {
      sampleReview = result.reviews[0];
    }
  });

  it('[GAGAL] getVenueReviews dengan slug tidak valid melempar error', async () => {
    await assert.rejects(
      async () => {
        await VenueService.getVenueReviews('slug-palsu-999');
      },
      /Lapangan tidak ditemukan/
    );
  });

  it('[BERHASIL] addReview menambahkan ulasan baru dan memperbarui rating_avg venue', async () => {
    const initialVenue = await VenueService.getVenueById('the-emerald-arena-jakarta');
    const initialDbCount = await Review.count({ where: { venue_id: initialVenue.id } });

    const newReview = await VenueService.addReview('the-emerald-arena-jakarta', {
      rating_overall: 5,
      rating_floor: 5,
      rating_lighting: 4,
      rating_cleanliness: 5,
      rating_hospitality: 5,
      comment: 'Lantai interlocking sangat empuk dan grip mantap!',
      user_name: 'Budi Santoso Pemain'
    });

    assert.ok(newReview.id);
    assert.equal(Number(newReview.rating_overall), 5);
    assert.equal(newReview.user_name, 'Budi Santoso Pemain');

    // Cek update di venue
    const updatedVenue = await VenueService.getVenueById('the-emerald-arena-jakarta');
    assert.equal(updatedVenue.review_count, initialDbCount + 1);

    // Simpan sampleReview untuk uji balasan
    sampleReview = newReview;
  });

  it('[BERHASIL] addReview dengan user terautentikasi mencatat identitas & badge', async () => {
    const authUser = {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Rian Pratama',
      role: 'user'
    };

    const review = await VenueService.addReview('the-emerald-arena-jakarta', {
      rating_overall: 4,
      comment: 'Fasilitas sangat rapi dan bersih.'
    }, authUser);

    assert.equal(review.user_id, authUser.id);
    assert.equal(review.user_name, 'Rian Pratama');
    assert.equal(review.user_role, 'Verified Booker');

    // Clean up review tambahan
    await Review.destroy({ where: { id: review.id } });
  });

  it('[GAGAL] addReview ke venue yang tidak ada melempar error', async () => {
    await assert.rejects(
      async () => {
        await VenueService.addReview('venue-khayalan-9999', {
          rating_overall: 5,
          comment: 'Komentar'
        });
      },
      /Lapangan tidak ditemukan/
    );
  });

  it('[BERHASIL] replyReview memperbarui balasan pengelola pada ulasan', async () => {
    assert.ok(sampleReview, 'sampleReview harus tersedia');
    const replyText = 'Terima kasih banyak atas feedback positifnya! Ditunggu kedatangannya kembali.';

    const updated = await VenueService.replyReview(sampleReview.id, replyText, { name: 'Owner Lapang' });
    assert.equal(updated.owner_reply, replyText);
    assert.ok(updated.owner_replied_at);
  });

  it('[GAGAL] replyReview dengan reviewId yang tidak ada melempar error', async () => {
    await assert.rejects(
      async () => {
        await VenueService.replyReview('00000000-0000-0000-0000-000000000000', 'Balasan', {});
      },
      /Ulasan tidak ditemukan/
    );
  });

  // Schedules
  it('[BERHASIL] getVenueSchedules mengembalikan ketersediaan slot hari ini', async () => {
    const sched = await VenueService.getVenueSchedules('the-emerald-arena-jakarta');
    assert.ok(sched);
    assert.ok(Array.isArray(sched.slots));
    assert.ok(sched.slots.length > 0);
    assert.ok(Array.isArray(sched.bookedSlots));
    assert.ok(sched.date);
  });

  it('[BERHASIL] getVenueSchedules mengembalikan slot untuk tanggal tertentu di masa depan', async () => {
    const targetDate = '2026-10-25';
    const sched = await VenueService.getVenueSchedules('the-emerald-arena-jakarta', targetDate);
    assert.ok(sched);
    assert.equal(sched.date, targetDate);
    assert.ok(Array.isArray(sched.slots));
  });

  it('[GAGAL] getVenueSchedules untuk venue yang tidak ada melempar error', async () => {
    await assert.rejects(
      async () => {
        await VenueService.getVenueSchedules('venue-tidak-ada-xyz');
      },
      /Lapangan tidak ditemukan/
    );
  });
});

