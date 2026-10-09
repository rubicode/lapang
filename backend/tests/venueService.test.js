import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VenueService } from '../services/venueService.js';

describe('VenueService Unit Tests (Skenario Berhasil & Gagal)', () => {
  it('[BERHASIL] Mengambil seluruh daftar lapangan olahraga', async () => {
    const venues = await VenueService.getVenues({});
    assert.ok(Array.isArray(venues), 'Venues harus berupa array');
    assert.ok(venues.length > 0, 'Harus ada venue yang dikembalikan');
    
    const first = venues[0];
    assert.ok(first.name, 'Venue harus memiliki nama');
    assert.ok(first.city_name || first.city, 'Venue harus memiliki kota');
    assert.ok(typeof first.base_price_hourly === 'number' || typeof first.priceHourly === 'number', 'Tarif harus berupa angka');
  });

  it('[BERHASIL] Filter lapangan berdasarkan cabang olahraga (Futsal)', async () => {
    const venues = await VenueService.getVenues({ sport: 'futsal' });
    assert.ok(Array.isArray(venues));
    venues.forEach(v => {
      const isFutsal = v.sport === 'futsal' || (v.courts && v.courts.some(c => c.category_id === 'futsal'));
      assert.ok(isFutsal, `Venue ${v.name} harus bertipe futsal`);
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

  it('[BERHASIL] Ambil detail venue berdasarkan slug valid', async () => {
    const venue = await VenueService.getVenueById('the-emerald-arena-jakarta');
    assert.ok(venue, 'Venue harus ditemukan');
    assert.equal(venue.slug, 'the-emerald-arena-jakarta');
  });

  it('[GAGAL] Pencarian dengan kata kunci yang tidak ada harus mengembalikan array kosong', async () => {
    const venues = await VenueService.getVenues({ search: 'NAMA_VENUE_TIDAK_MUNGKIN_ADA_XYZ_999' });
    assert.ok(Array.isArray(venues));
    assert.equal(venues.length, 0, 'Daftar venue harus kosong jika tidak ada yang cocok');
  });
});
