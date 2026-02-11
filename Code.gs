function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Drive Permission Manager')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * ファイル一覧を取得する (Drive API v2使用)
 * @param {string} pageToken - ページネーショントークン
 * @param {string} category - ファイル種別フィルタ (all, spreadsheet, document, presentation, pdf)
 * @param {boolean} onlyOwner - 自分がオーナーのものに絞るかどうか
 * @param {boolean} onlyRisky - 公開中のものに絞るかどうか
 */
function getDriveFiles(pageToken, category, onlyOwner, onlyRisky) {
  try {
    if (typeof Drive === 'undefined') {
      throw new Error('Drive API サービスが有効になっていません。エディタの左側「サービス」から「Drive API」を追加してください。');
    }

    var mimeTypes = [];
    if (!category || category === 'all') {
      mimeTypes = [
        '"application/vnd.google-apps.spreadsheet"',
        '"application/vnd.google-apps.document"',
        '"application/vnd.google-apps.presentation"',
        '"application/pdf"'
      ];
    } else {
      switch(category) {
        case 'spreadsheet':
          mimeTypes = ['"application/vnd.google-apps.spreadsheet"'];
          break;
        case 'document':
          mimeTypes = ['"application/vnd.google-apps.document"'];
          break;
        case 'presentation':
          mimeTypes = ['"application/vnd.google-apps.presentation"'];
          break;
        case 'pdf':
          mimeTypes = ['"application/pdf"'];
          break;
        default:
           // default to all if unknown
           mimeTypes = [
            '"application/vnd.google-apps.spreadsheet"',
            '"application/vnd.google-apps.document"',
            '"application/vnd.google-apps.presentation"',
            '"application/pdf"'
          ];
      }
    }

    // クエリ構築: (mimeType = "..." or mimeType = "...")
    var mimeConditions = mimeTypes.map(function(type) {
      return 'mimeType = ' + type;
    });
    var mimeQuery = '(' + mimeConditions.join(' or ') + ')';
    var query = mimeQuery + ' and trashed = false';
    
    // オーナー絞り込み
    if (onlyOwner) {
      query += ' and "me" in owners';
    }

    // リスクあり（公開中）絞り込み
    // Drive API v2 では visibility パラメータで絞り込みが可能
    if (onlyRisky) {
      query += " and (visibility = 'anyoneCanFind' or visibility = 'anyoneWithLink')"; 
    }
    
    var params = {
      q: query,
      maxResults: 30,
      pageToken: pageToken || null,
      orderBy: 'modifiedDate desc',
      fields: 'nextPageToken, items(id, title, modifiedDate, alternateLink, permissions, mimeType, iconLink)'
    };

    var response = Drive.Files.list(params);
    var files = [];
    
    if (response.items) {
      for (var i = 0; i < response.items.length; i++) {
        var item = response.items[i];
        
        // 公開設定の判定
        var access = "PRIVATE"; 
        var perms = item.permissions || [];
        
        for (var j = 0; j < perms.length; j++) {
          var p = perms[j];
          if (p.id === 'anyone') {
            access = 'ANYONE';
            break;
          }
          if (p.id === 'anyoneWithLink') {
            access = 'ANYONE_WITH_LINK';
          }
        }

        files.push({
          id: item.id,
          name: item.title,
          lastUpdated: new Date(item.modifiedDate).toLocaleString(),
          url: item.alternateLink,
          access: access,
          mimeType: item.mimeType,
          iconLink: item.iconLink 
        });
      }
    }

    return { 
      success: true, 
      files: files, 
      nextPageToken: response.nextPageToken 
    };

  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * 特定のファイルの権限情報を取得する
 */
function getFilePermissions(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    var editors = file.getEditors();
    var viewers = file.getViewers();
    var owner = file.getOwner();
    var access = file.getSharingAccess();
    
    var permissions = [];
    
    // オーナー
    if (owner) {
      permissions.push({
        email: owner.getEmail(),
        name: owner.getName(),
        role: 'OWNER',
        photoUrl: owner.getPhotoUrl ? owner.getPhotoUrl() : null
      });
    }
    
    // 編集者
    editors.forEach(function(u) {
      permissions.push({
        email: u.getEmail(),
        name: u.getName(),
        role: 'EDITOR',
        photoUrl: u.getPhotoUrl ? u.getPhotoUrl() : null
      });
    });
    
    // 閲覧者
    viewers.forEach(function(u) {
      permissions.push({
        email: u.getEmail(),
        name: u.getName(),
        role: 'VIEWER',
        photoUrl: u.getPhotoUrl ? u.getPhotoUrl() : null
      });
    });
    
    return { 
      success: true, 
      permissions: permissions, 
      fileName: file.getName(),
      access: access.toString(),
      fileUrl: file.getUrl(),
      mimeType: file.getMimeType()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * ファイルを非公開にする
 */
function setFilePrivate(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    return getFilePermissions(fileId);
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * 権限を追加する
 */
function addUserPermission(fileId, email, role) {
  try {
    var file = DriveApp.getFileById(fileId);
    if (role === 'EDITOR') {
      file.addEditor(email);
    } else if (role === 'VIEWER') {
      file.addViewer(email);
    }
    return getFilePermissions(fileId);
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * 権限を削除する
 */
function removeUserPermission(fileId, email) {
  try {
    var file = DriveApp.getFileById(fileId);
    
    var isEditor = false;
    var editors = file.getEditors();
    for (var i = 0; i < editors.length; i++) {
      if (editors[i].getEmail() === email) {
        file.removeEditor(email);
        isEditor = true;
        break;
      }
    }
    
    if (!isEditor) {
      var viewers = file.getViewers();
      for (var i = 0; i < viewers.length; i++) {
        if (viewers[i].getEmail() === email) {
          file.removeViewer(email);
          break;
        }
      }
    }
    
    return getFilePermissions(fileId);
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
