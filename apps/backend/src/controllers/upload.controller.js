import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  uploadFile,
  deleteFile,
  generateUniqueFileName,
  validateImageFile,
} from '../services/storageService.js';

/**
 * Upload athlete photo
 */
export const uploadAthletePhoto = async (req, res, next) => {
  try {
    const { athleteId } = req.params;
    const file = req.file;

    console.log(`📸 Uploading athlete photo for athlete: ${athleteId}`);
    console.log(`📄 File info:`, { 
      name: file?.originalname, 
      size: file?.size, 
      mime: file?.mimetype,
      present: !!file,
      buffer: !!file?.buffer,
      bufferLength: file?.buffer?.length
    });

    if (!file) {
      console.error('❌ No file provided in request');
      throw new AppError('No file uploaded', 400);
    }

    // Validate file
    validateImageFile(file);

    // Check if athlete exists
    const { data: athlete, error: fetchError } = await supabase
      .from('athletes')
      .select('id, photo_url')
      .eq('id', athleteId)
      .single();

    if (fetchError || !athlete) {
      console.error('❌ Athlete not found:', fetchError);
      throw new AppError('Athlete not found', 404);
    }

    // Delete old photo if exists
    if (athlete.photo_url) {
      try {
        const oldPath = athlete.photo_url.split('/').slice(-1)[0];
        await deleteFile('athletes', `photos/${oldPath}`);
      } catch (err) {
        console.log('Old photo delete failed (may not exist):', err.message);
      }
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.originalname);
    const filePath = `photos/${fileName}`;

    console.log(`🔄 Uploading to path: ${filePath}`);

    // Upload to Supabase Storage
    const uploadResult = await uploadFile('athletes', filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    console.log(`✅ Upload successful. URL: ${uploadResult.publicUrl}`);

    // Update athlete record
    const { error: updateError } = await supabase
      .from('athletes')
      .update({ photo_url: uploadResult.publicUrl })
      .eq('id', athleteId);

    if (updateError) {
      // Cleanup uploaded file on DB error
      await deleteFile('athletes', filePath);
      throw new AppError('Failed to update athlete record', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: uploadResult.publicUrl,
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    next(error);
  }
};

/**
 * Upload competition logo
 */
export const uploadCompetitionLogo = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const file = req.file;

    console.log(`🏆 Uploading competition logo for competition: ${competitionId}`);
    console.log(`📄 File info:`, { 
      name: file?.originalname, 
      size: file?.size, 
      mime: file?.mimetype,
      present: !!file,
      buffer: !!file?.buffer,
      bufferLength: file?.buffer?.length
    });

    if (!file) {
      console.error('❌ No file provided in request');
      throw new AppError('No file uploaded', 400);
    }

    validateImageFile(file);

    // Check if competition exists
    const { data: competition, error: fetchError } = await supabase
      .from('competitions')
      .select('id, logo_url')
      .eq('id', competitionId)
      .single();

    if (fetchError || !competition) {
      console.error('❌ Competition not found:', fetchError);
      throw new AppError('Competition not found', 404);
    }

    // Delete old logo if exists
    if (competition.logo_url) {
      try {
        const oldPath = competition.logo_url.split('/').slice(-1)[0];
        await deleteFile('competitions', `logos/${oldPath}`);
      } catch (err) {
        console.log('Old logo delete failed:', err.message);
      }
    }

    const fileName = generateUniqueFileName(file.originalname);
    const filePath = `logos/${fileName}`;

    console.log(`🔄 Uploading to path: ${filePath}`);

    const uploadResult = await uploadFile('competitions', filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    console.log(`✅ Upload successful. URL: ${uploadResult.publicUrl}`);

    const { error: updateError } = await supabase
      .from('competitions')
      .update({ logo_url: uploadResult.publicUrl })
      .eq('id', competitionId);

    if (updateError) {
      await deleteFile('competitions', filePath);
      throw new AppError('Failed to update competition record', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl: uploadResult.publicUrl,
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    next(error);
  }
};

/**
 * Upload team logo
 */
export const uploadTeamLogo = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const file = req.file;

    console.log(`👥 Uploading team logo for team: ${teamId}`);
    console.log(`📄 File info:`, { 
      name: file?.originalname, 
      size: file?.size, 
      mime: file?.mimetype,
      present: !!file,
      buffer: !!file?.buffer,
      bufferLength: file?.buffer?.length
    });

    if (!file) {
      console.error('❌ No file provided in request');
      throw new AppError('No file uploaded', 400);
    }

    validateImageFile(file);

    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('id, logo_url')
      .eq('id', teamId)
      .single();

    if (fetchError || !team) {
      console.error('❌ Team not found:', fetchError);
      throw new AppError('Team not found', 404);
    }

    if (team.logo_url) {
      try {
        const oldPath = team.logo_url.split('/').slice(-1)[0];
        await deleteFile('teams', `logos/${oldPath}`);
      } catch (err) {
        console.log('Old logo delete failed:', err.message);
      }
    }

    const fileName = generateUniqueFileName(file.originalname);
    const filePath = `logos/${fileName}`;

    const uploadResult = await uploadFile('teams', filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    const { error: updateError } = await supabase
      .from('teams')
      .update({ logo_url: uploadResult.publicUrl })
      .eq('id', teamId);

    if (updateError) {
      await deleteFile('teams', filePath);
      throw new AppError('Failed to update team record', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl: uploadResult.publicUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete athlete photo
 */
export const deleteAthletePhoto = async (req, res, next) => {
  try {
    const { athleteId } = req.params;

    const { data: athlete, error: fetchError } = await supabase
      .from('athletes')
      .select('id, photo_url')
      .eq('id', athleteId)
      .single();

    if (fetchError || !athlete) {
      throw new AppError('Athlete not found', 404);
    }

    if (!athlete.photo_url) {
      throw new AppError('No photo to delete', 400);
    }

    const path = athlete.photo_url.split('/').slice(-1)[0];
    await deleteFile('athletes', `photos/${path}`);

    const { error: updateError } = await supabase
      .from('athletes')
      .update({ photo_url: null })
      .eq('id', athleteId);

    if (updateError) {
      throw new AppError('Failed to update athlete record', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
