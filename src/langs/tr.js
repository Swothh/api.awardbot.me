module.exports = {
  bot: {
    help: {
      text: "Yardım",
      description: "Botun bir komutu yok. Çekiliş oluşturmak veya yönetmek için web sitemizi ziyaret etmeli ve kontrol paneline giriş yapmalısınız. \n\n Kontrol Paneli: https://awardbot.me/dashboard",
    },
    invite: {
      invitations: "Davetleri",
      not_found: "Davet bulunamadı!",
      description: "Sunucuda yaptığınız davetlerin detaylı istatistiklerini gösterir.",
      all_invites: "Tüm Davetler",
      regular: "Gerçek",
      left: "Ayrılan",
      fake: "Fake"
    },
    language: {
      embed_description: "Botun dili başarıyla değiştirildi.",
      text: "Dil",
      from: "Önceki Dil",
      to: "Sonraki Dil"
    },
    permission: {
      noperm: ":x: **|** Bu komutu kullanmak için `*` veya `MANAGE_PERMS` iznine sahip olmalısınız **!**",
      list_text: " İzinleri",
      add_description: "`**|** ``{username}`` adlı kişiden ``{perm}`` izni verildi. **!**",
      remove_description: "**|** ``{username}`` adlı kişiden ``{perm}`` izni kaldırıldı. **!**",
      default: "**|** Bilinmeyen komut **!**"
    },
    redeem: {
      noperm: ":x: **|** Bu komutu kullanmak için `*` izniniz olmalıdır **!**",
      not_found: ":x: **|** Redeem kodu bulunamadı **!**",
      embed_text: "📎 | Sizin için bir promosyon kodumuz var! ",
      embed_description: "> `🖇️` __Kod:__ ``{code}`` \n> `💻` __Maksimum Kullanım:__ ``{code_uses}`` \n> `⏲️` __Son kullanma tarihi:__ <t:{time}>"
    }
  },
};